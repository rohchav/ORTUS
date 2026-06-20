import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundaryModelArtifactType,
  causalAssumptionModelArtifactType,
  controlStrategyModelArtifactType,
  createDefaultScenario,
  createEngineFromScenario,
  delayQueueArtifactType,
  deserializeControlStrategyModel,
  emergencePatternModelArtifactType,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType,
  fieldLayerArtifactType,
  getArtifactFamily,
  getConstraint,
  getConstraintsForStrategy,
  getControlStrategyWarnings,
  getExpectedEffect,
  getExpectedEffectsForStrategy,
  getIntervention,
  getInterventionDefinition,
  getInterventionsForStrategy,
  getObjective,
  getObjectivesForStrategy,
  getPoliciesForStrategy,
  getPolicy,
  getPrimitive,
  getStoppingRule,
  getStoppingRulesForStrategy,
  getStrategy,
  getTemplateCapability,
  getTrigger,
  getTriggersForStrategy,
  hybridCompositionArtifactType,
  listActiveInterventions,
  listActiveStrategies,
  listCandidateStrategies,
  listConstraints,
  listExpectedEffects,
  listInterventions,
  listObjectives,
  listObservedStrategies,
  listPlannedStrategies,
  listPolicies,
  listReservedPrimitives,
  listServiceOnlyPrimitives,
  listStoppingRules,
  listStrategies,
  listStrategiesByKind,
  listStrategiesByStatus,
  listTriggers,
  modelHasExternallyValidatedStrategies,
  modelHasPlannedStrategies,
  modelHasTemplateInterventionReferences,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  observabilityModelArtifactType,
  productionTemplateMap,
  productionTemplates,
  quantitySemanticsModelArtifactType,
  resourceMetricsArtifactType,
  resourceSystemArtifactType,
  robustnessResilienceModelArtifactType,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  serializeControlStrategyModel,
  snapshotArtifactType,
  summarizeControlStrategyModel,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateCompositionCapabilities,
  validateControlStrategyModel,
  validateControlStrategyModelForRuntime,
  type ControlStrategyModel,
  type HybridModelComposition,
  type StrategyDescriptor
} from "../index";

const repoRoot = process.cwd();

function controlModel(overrides: Partial<ControlStrategyModel> = {}): ControlStrategyModel {
  return {
    schemaVersion: "1",
    artifactType: controlStrategyModelArtifactType,
    id: "control-model",
    name: "Control Model",
    version: "1.0.0",
    strategies: [
      {
        id: "candidate-strategy",
        label: "Candidate Strategy",
        strategyKind: "intervention",
        status: "candidate",
        active: false,
        executable: false
      }
    ],
    ...overrides
  };
}

function fullControlModel(overrides: Partial<ControlStrategyModel> = {}): ControlStrategyModel {
  return controlModel({
    scope: {
      templateId: "forest-fire",
      scenarioId: "scenario-1",
      runConfigId: "run-config-1",
      uncertaintyConfigId: "uncertainty-1",
      uncertaintyResultId: "uncertainty-result-1",
      robustnessResilienceModelId: "robustness-1",
      emergencePatternModelId: "emergence-1",
      causalAssumptionModelId: "causal-1",
      observabilityModelId: "observability-1",
      resourceSystemId: "resource-1",
      feedbackLoopModelId: "feedback-1",
      networkDefinitionId: "network-1",
      quantitySemanticsModelId: "quantity-1",
      boundaryModelId: "boundary-1",
      notes: ["Scope is structural only."]
    },
    interventions: [
      {
        id: "ignite-reference",
        label: "Ignite Reference",
        interventionKind: "templateInterventionReference",
        templateInterventionId: "forestFire.igniteCell",
        targetDescription: "A structural reference to the forest-fire ignite-cell template intervention.",
        magnitudeDescription: "Ignite one selected fuel cell in the existing runtime intervention system.",
        timingDescription: "Declared as future strategy metadata only.",
        durationDescription: "Immediate template action if executed elsewhere, not by this model.",
        active: true,
        executable: false
      },
      {
        id: "spread-change",
        label: "Spread Change",
        interventionKind: "parameterChange",
        targetPath: "parameters.spreadProbability",
        targetDescription: "Stylized spread parameter.",
        magnitudeDescription: "Decrease within declared model bounds.",
        timingDescription: "Before a fresh run in a future scenario workflow.",
        durationDescription: "Scenario-level metadata only.",
        active: false,
        executable: false
      }
    ],
    triggers: [
      {
        id: "burning-trigger",
        label: "Burning Trigger",
        triggerKind: "metricCondition",
        conditionDescription: "Burning fraction exceeds a declared model-output threshold.",
        metricId: "burningFraction",
        quantityId: "burning-fraction",
        active: true,
        executable: false
      }
    ],
    objectives: [
      {
        id: "limit-burning",
        label: "Limit Burning",
        objectiveKind: "maintainWithinBounds",
        targetDescription: "Keep burning fraction below a declared model-output threshold.",
        metricId: "burningFraction",
        quantityId: "burning-fraction",
        priorityDescription: "Descriptive priority only.",
        active: true,
        executable: false
      }
    ],
    constraints: [
      {
        id: "one-cell-budget",
        label: "One Cell Budget",
        constraintKind: "budget",
        constraintDescription: "Use at most one template intervention reference in the structural plan.",
        hardConstraint: true,
        active: true,
        executable: false
      }
    ],
    policies: [
      {
        id: "if-burning-then-ignite",
        label: "If Burning Then Ignite",
        policyKind: "ifThen",
        ruleDescription: "If the structural trigger is met, reference the ignite-cell intervention.",
        triggerIds: ["burning-trigger"],
        interventionIds: ["ignite-reference"],
        constraintIds: ["one-cell-budget"],
        active: true,
        executable: false
      }
    ],
    stoppingRules: [
      {
        id: "stop-at-tick",
        label: "Stop At Tick",
        stoppingKind: "timeLimit",
        ruleDescription: "Stop after a declared number of model ticks in a future runtime phase.",
        active: true,
        executable: false
      }
    ],
    expectedEffects: [
      {
        id: "burning-decrease",
        label: "Burning Decrease",
        effectKind: "decrease",
        affectedTargetDescription: "Burning fraction model output.",
        evidenceDescription: "No empirical evidence is claimed in V1.",
        uncertaintyDescription: "Uncertainty is descriptive, not calibrated.",
        riskDescription: "Could worsen model output under some assumptions.",
        active: true,
        executable: false
      }
    ],
    strategies: [
      {
        id: "candidate-strategy",
        label: "Candidate Strategy",
        strategyKind: "intervention",
        status: "candidate",
        targetDescription: "Abstract landscape spread response.",
        interventionIds: ["ignite-reference"],
        triggerIds: ["burning-trigger"],
        objectiveIds: ["limit-burning"],
        constraintIds: ["one-cell-budget"],
        policyIds: ["if-burning-then-ignite"],
        stoppingRuleIds: ["stop-at-tick"],
        expectedEffectIds: ["burning-decrease"],
        active: true,
        executable: false
      },
      {
        id: "planned-policy",
        label: "Planned Policy",
        strategyKind: "policy",
        status: "planned",
        targetDescription: "Future policy comparison metadata.",
        interventionIds: ["spread-change"],
        objectiveIds: ["limit-burning"],
        policyIds: ["if-burning-then-ignite"],
        active: false,
        executable: false
      },
      {
        id: "observed-output",
        label: "Observed Output",
        strategyKind: "openLoopControl",
        status: "observedInModelOutput",
        targetDescription: "Model-output trace only.",
        interventionIds: ["spread-change"],
        objectiveIds: ["limit-burning"],
        active: false,
        executable: false
      },
      {
        id: "internal-test",
        label: "Internal Test",
        strategyKind: "feedbackControl",
        status: "internallyTested",
        targetDescription: "Internal fixture only.",
        interventionIds: ["ignite-reference"],
        objectiveIds: ["limit-burning"],
        active: false,
        executable: false
      },
      {
        id: "external-strategy",
        label: "External Strategy",
        strategyKind: "mitigation",
        status: "externallyValidated",
        targetDescription: "Fixture with provenance notes only.",
        interventionIds: ["spread-change"],
        objectiveIds: ["limit-burning"],
        active: false,
        executable: false,
        notes: ["External evidence would require review outside V1."]
      },
      {
        id: "rejected-strategy",
        label: "Rejected Strategy",
        strategyKind: "adaptiveStrategy",
        status: "rejected",
        targetDescription: "Rejected fixture.",
        interventionIds: ["spread-change"],
        objectiveIds: ["limit-burning"],
        active: false,
        executable: false
      }
    ],
    ...overrides
  });
}

function composition(overrides: Partial<HybridModelComposition> = {}): HybridModelComposition {
  return {
    schemaVersion: "1",
    artifactType: hybridCompositionArtifactType,
    id: "control-composition",
    name: "Control Composition",
    version: "1.0.0",
    baseTemplateId: "forest-fire",
    primitiveAttachments: [],
    requiredCapabilities: [],
    ...overrides
  };
}

describe("strategy, control, and intervention semantics services", () => {
  it("validates control strategy models conservatively", () => {
    expect(validateControlStrategyModel(controlModel()).id).toBe("control-model");
    expect(validateControlStrategyModel(fullControlModel()).strategies).toHaveLength(6);
    expect(() => validateControlStrategyModel(controlModel({ id: "" }))).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(controlModel({ name: "" }))).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(controlModel({ artifactType: "ortus.robustnessResilienceModel" as never }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(controlModel({ version: "" }))).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel({ ...controlModel(), strategies: undefined })).toThrow(/Invalid control strategy model/);
    expect(() =>
      validateControlStrategyModel(controlModel({ strategies: [controlModel().strategies[0]!, { ...controlModel().strategies[0]! }] }))
    ).toThrow(/Duplicate strategy id/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ interventions: [fullControlModel().interventions![0]!, { ...fullControlModel().interventions![0]! }] }))
    ).toThrow(/Duplicate intervention id/);
    expect(() => validateControlStrategyModel(fullControlModel({ triggers: [fullControlModel().triggers![0]!, { ...fullControlModel().triggers![0]! }] }))).toThrow(
      /Duplicate trigger id/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ objectives: [fullControlModel().objectives![0]!, { ...fullControlModel().objectives![0]! }] }))
    ).toThrow(/Duplicate objective id/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ constraints: [fullControlModel().constraints![0]!, { ...fullControlModel().constraints![0]! }] }))
    ).toThrow(/Duplicate constraint id/);
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [fullControlModel().policies![0]!, { ...fullControlModel().policies![0]! }] }))).toThrow(
      /Duplicate policy id/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ stoppingRules: [fullControlModel().stoppingRules![0]!, { ...fullControlModel().stoppingRules![0]! }] }))
    ).toThrow(/Duplicate stopping rule id/);
    expect(() =>
      validateControlStrategyModel(
        fullControlModel({ expectedEffects: [fullControlModel().expectedEffects![0]!, { ...fullControlModel().expectedEffects![0]! }] })
      )
    ).toThrow(/Duplicate expected effect id/);
    expect(() => validateControlStrategyModel(controlModel({ strategies: [{ ...controlModel().strategies[0]!, strategyKind: "optimizer" as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(controlModel({ strategies: [{ ...controlModel().strategies[0]!, status: "proven" as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, interventionIds: ["missing"] }] }))).toThrow(
      /unknown interventionId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, triggerIds: ["missing"] }] }))).toThrow(
      /unknown triggerId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, objectiveIds: ["missing"] }] }))).toThrow(
      /unknown objectiveId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, constraintIds: ["missing"] }] }))).toThrow(
      /unknown constraintId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, policyIds: ["missing"] }] }))).toThrow(
      /unknown policyId/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, stoppingRuleIds: ["missing"] }] }))
    ).toThrow(/unknown stoppingRuleId/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, expectedEffectIds: ["missing"] }] }))
    ).toThrow(/unknown expectedEffectId/);
    expect(() => validateControlStrategyModel(fullControlModel({ strategies: [{ ...fullControlModel().strategies[0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ interventions: [{ ...fullControlModel().interventions![0]!, interventionKind: "optimizer" as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ interventions: [{ ...fullControlModel().interventions![0]!, executable: true as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() =>
      validateControlStrategyModel(
        fullControlModel({
          interventions: [{ ...fullControlModel().interventions![0]!, templateInterventionId: undefined }, fullControlModel().interventions![1]!]
        })
      )
    ).toThrow(/missing templateInterventionId/);
    expect(() => validateControlStrategyModel(fullControlModel({ triggers: [{ ...fullControlModel().triggers![0]!, triggerKind: "detector" as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ triggers: [{ ...fullControlModel().triggers![0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ triggers: [{ ...fullControlModel().triggers![0]!, conditionDescription: "" }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ objectives: [{ ...fullControlModel().objectives![0]!, objectiveKind: "optimal" as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(fullControlModel({ objectives: [{ ...fullControlModel().objectives![0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ objectives: [{ ...fullControlModel().objectives![0]!, targetDescription: "" }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ constraints: [{ ...fullControlModel().constraints![0]!, constraintKind: "riskScore" as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(fullControlModel({ constraints: [{ ...fullControlModel().constraints![0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ constraints: [{ ...fullControlModel().constraints![0]!, constraintDescription: "" }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, policyKind: "rl" as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, triggerIds: ["missing"] }] }))).toThrow(
      /unknown triggerId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, interventionIds: ["missing"] }] }))).toThrow(
      /unknown interventionId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, constraintIds: ["missing"] }] }))).toThrow(
      /unknown constraintId/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ policies: [{ ...fullControlModel().policies![0]!, ruleDescription: "" }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ stoppingRules: [{ ...fullControlModel().stoppingRules![0]!, stoppingKind: "optimal" as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ stoppingRules: [{ ...fullControlModel().stoppingRules![0]!, executable: true as never }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => validateControlStrategyModel(fullControlModel({ stoppingRules: [{ ...fullControlModel().stoppingRules![0]!, ruleDescription: "" }] }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() =>
      validateControlStrategyModel(fullControlModel({ expectedEffects: [{ ...fullControlModel().expectedEffects![0]!, effectKind: "optimal" as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ expectedEffects: [{ ...fullControlModel().expectedEffects![0]!, executable: true as never }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() =>
      validateControlStrategyModel(fullControlModel({ expectedEffects: [{ ...fullControlModel().expectedEffects![0]!, affectedTargetDescription: "" }] }))
    ).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel({ ...controlModel(), extra: true })).toThrow(/Invalid control strategy model/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { metricHistory: [] } }))).toThrow(/metricHistory|live-state/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { value: Infinity } }))).toThrow(/non-finite/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/dataset/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/timeSeries/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { optimizer: "best-policy" } }))).toThrow(/optimizer/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { controller: "pid" } }))).toThrow(/controller/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { policyEngine: "executor" } }))).toThrow(/policyEngine/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { reinforcementLearning: {} } }))).toThrow(/reinforcementLearning/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { modelPredictiveControl: {} } }))).toThrow(/modelPredictiveControl/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { causalEffect: 0.2 } }))).toThrow(/causalEffect/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { treatmentEffect: 0.2 } }))).toThrow(/treatmentEffect/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { policyRecommendation: "act" } }))).toThrow(/policyRecommendation/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { recommendedAction: "act" } }))).toThrow(/recommendedAction/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { actionRanking: [] } }))).toThrow(/actionRanking/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { rankedPolicies: [] } }))).toThrow(/rankedPolicies/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { riskScore: 0.2 } }))).toThrow(/riskScore/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { safetyScore: 0.9 } }))).toThrow(/safetyScore/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { pValue: 0.01 } }))).toThrow(/pValue/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { significance: true } }))).toThrow(/significance/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { certification: "safe" } }))).toThrow(/certification/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { proof: "works" } }))).toThrow(/proof/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { experimentResults: [] } }))).toThrow(/experimentResults/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { interventionResults: [] } }))).toThrow(/interventionResults/);
    expect(() => validateControlStrategyModel(controlModel({ metadata: { huge: "x".repeat(230_000) } }))).toThrow(/Control strategy model/);
    expect(() => validateControlStrategyModel(new Date())).toThrow(/plain JSON|Invalid control strategy model/);
    expect(() => validateControlStrategyModel({ ...controlModel(), metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid control strategy model|executable-shaped/
    );
  });

  it("surfaces control warnings without implying proof, optimization, certification, validation, or runtime execution", () => {
    const warned = fullControlModel({
      strategies: [
        { id: "external-no-notes", label: "External No Notes", strategyKind: "mitigation", status: "externallyValidated", active: false, executable: false },
        {
          id: "observed-output",
          label: "Observed Output",
          strategyKind: "openLoopControl",
          status: "observedInModelOutput",
          interventionIds: ["ignite-reference"],
          objectiveIds: ["limit-burning"],
          active: false,
          executable: false
        },
        {
          id: "internal-check",
          label: "Internal Check",
          strategyKind: "feedbackControl",
          status: "internallyTested",
          interventionIds: ["ignite-reference"],
          objectiveIds: ["limit-burning"],
          active: false,
          executable: false
        },
        {
          id: "planned-check",
          label: "Planned Check",
          strategyKind: "policy",
          status: "planned",
          interventionIds: ["ignite-reference"],
          objectiveIds: ["limit-burning"],
          active: false,
          executable: false
        },
        { id: "hypothesis", label: "Hypothesis", strategyKind: "adaptiveStrategy", status: "hypothesized", active: true, executable: false },
        {
          id: "broad-claim",
          label: "Broad Claim",
          strategyKind: "policy",
          status: "candidate",
          targetDescription: "Broad applicability claim for real-world operational policy.",
          active: false,
          executable: false
        }
      ],
      interventions: [
        fullControlModel().interventions![0]!,
        { id: "empty-intervention", label: "Empty Intervention", interventionKind: "stateChange", active: true, executable: false }
      ],
      triggers: [
        fullControlModel().triggers![0]!,
        { id: "empty-trigger", label: "Empty Trigger", triggerKind: "threshold", conditionDescription: "Declared condition only.", active: true, executable: false }
      ],
      objectives: [
        fullControlModel().objectives![0]!,
        { id: "empty-objective", label: "Empty Objective", objectiveKind: "minimize", targetDescription: "Declared target only.", active: true, executable: false }
      ],
      constraints: [
        fullControlModel().constraints![0]!,
        {
          id: "safety-constraint",
          label: "Safety Constraint",
          constraintKind: "safety",
          constraintDescription: "Safety language is descriptive only.",
          active: false,
          executable: false
        }
      ],
      policies: [fullControlModel().policies![0]!, { id: "empty-policy", label: "Empty Policy", policyKind: "ifThen", ruleDescription: "Declared rule only.", active: true, executable: false }],
      stoppingRules: [fullControlModel().stoppingRules![0]!],
      expectedEffects: [
        fullControlModel().expectedEffects![0]!,
        { id: "empty-effect", label: "Empty Effect", effectKind: "unknown", affectedTargetDescription: "Declared effect only.", active: true, executable: false }
      ]
    });
    const warnings = getControlStrategyWarnings(warned).join(" ");
    expect(warnings).toMatch(/externallyValidated without validation or provenance notes/);
    expect(warnings).toMatch(/model output is not real-world strategy validation/);
    expect(warnings).toMatch(/internal checks are software\/model checks, not empirical validation/);
    expect(warnings).toMatch(/no strategy or policy is executed by this descriptor/);
    expect(warnings).toMatch(/strategy effectiveness is not confirmed/);
    expect(warnings).toMatch(/Active strategy hypothesis is structural only/);
    expect(warnings).toMatch(/broad-applicability language without external validation/);
    expect(warnings).toMatch(/no intervention references/);
    expect(warnings).toMatch(/no objective references/);
    expect(warnings).toMatch(/no targetDescription/);
    expect(warnings).toMatch(/no runtime control loop exists/);
    expect(warnings).toMatch(/no learning or adaptation is executed/);
    expect(warnings).toMatch(/Active intervention empty-intervention is structural only and is not executed/);
    expect(warnings).toMatch(/no targetPath, templateInterventionId, or targetDescription/);
    expect(warnings).toMatch(/no magnitude, timing, or duration description/);
    expect(warnings).toMatch(/references a template intervention structurally/);
    expect(warnings).toMatch(/Active trigger empty-trigger is structural only and is not monitored at runtime/);
    expect(warnings).toMatch(/no metric, observation, event, or quantity reference/);
    expect(warnings).toMatch(/Active objective empty-objective is structural only and is not optimized or evaluated/);
    expect(warnings).toMatch(/no metricId or quantityId/);
    expect(warnings).toMatch(/priorityDescription is descriptive only and is not optimized/);
    expect(warnings).toMatch(/Active constraint one-cell-budget is structural only and is not enforced/);
    expect(warnings).toMatch(/hardConstraint, but constraints are not enforced/);
    expect(warnings).toMatch(/Constraint safety-constraint is safety; declaration is not certification or enforcement/);
    expect(warnings).toMatch(/Active policy empty-policy is structural only and is not executed/);
    expect(warnings).toMatch(/Policy empty-policy ruleDescription is descriptive text; it is not parsed or executed/);
    expect(warnings).toMatch(/Policy empty-policy has no trigger or intervention references/);
    expect(warnings).toMatch(/Stopping rule stop-at-tick is a structural declaration and is not enforced/);
    expect(warnings).toMatch(/Active expected effect empty-effect is structural only and is not measured or guaranteed/);
    expect(warnings).toMatch(/Expected effect empty-effect has no evidence, uncertainty, or risk description/);
    expect(warnings).toMatch(/Expected effect burning-decrease evidenceDescription is documentation only, not proof or a measured effect/);
    expect(warnings).toMatch(/uncertainty does not prove strategy effectiveness/);
    expect(warnings).toMatch(/robustness descriptors do not prove a strategy is robust/);
    expect(warnings).toMatch(/pattern descriptors do not validate strategies/);
    expect(warnings).toMatch(/causal assumptions do not prove intervention effects/);
    expect(warnings).toMatch(/measurement structure does not monitor or control anything at runtime/);
    expect(warnings).toMatch(/units do not validate control objectives/);
    expect(warnings).toMatch(/attached primitives are not controlled at runtime/);
    expect(warnings).toMatch(/not wildfire management guidance/);
    expect(warnings).not.toMatch(/will execute|statistically significant|certified safe|operationally ready|optimal strategy|proven effective/i);

    const report = validateControlStrategyModelForRuntime(warned);
    expect(report).toMatchObject({ valid: true, runnableNow: false });
    expect(report.missingCapabilities[0]).toMatchObject({ primitiveId: "interventionStrategy", requiredSupportLevel: "runtime" });
    expect(report.warnings.join(" ")).toContain("do not execute or prove strategies");
  });

  it("queries and summarizes control strategy descriptors without mutating input", () => {
    const model = fullControlModel();
    const before = JSON.stringify(model);
    expect(listStrategies(model).map((strategy) => strategy.id)).toEqual([
      "candidate-strategy",
      "planned-policy",
      "observed-output",
      "internal-test",
      "external-strategy",
      "rejected-strategy"
    ]);
    expect(listActiveStrategies(model).map((strategy) => strategy.id)).toEqual(["candidate-strategy"]);
    expect(getStrategy(model, "candidate-strategy")?.strategyKind).toBe("intervention");
    expect(listStrategiesByKind(model, "policy").map((strategy) => strategy.id)).toEqual(["planned-policy"]);
    expect(listStrategiesByStatus(model, "externallyValidated").map((strategy) => strategy.id)).toEqual(["external-strategy"]);
    expect(listCandidateStrategies(model).map((strategy) => strategy.id)).toEqual(["candidate-strategy"]);
    expect(listPlannedStrategies(model).map((strategy) => strategy.id)).toEqual(["planned-policy"]);
    expect(listObservedStrategies(model).map((strategy) => strategy.id)).toEqual(["observed-output"]);
    expect(listInterventions(model)).toHaveLength(2);
    expect(listActiveInterventions(model).map((intervention) => intervention.id)).toEqual(["ignite-reference"]);
    expect(getIntervention(model, "ignite-reference")?.interventionKind).toBe("templateInterventionReference");
    expect(getInterventionsForStrategy(model, "candidate-strategy").map((intervention) => intervention.id)).toEqual(["ignite-reference"]);
    expect(listTriggers(model)).toHaveLength(1);
    expect(getTrigger(model, "burning-trigger")?.triggerKind).toBe("metricCondition");
    expect(getTriggersForStrategy(model, "candidate-strategy").map((trigger) => trigger.id)).toEqual(["burning-trigger"]);
    expect(listObjectives(model)).toHaveLength(1);
    expect(getObjective(model, "limit-burning")?.objectiveKind).toBe("maintainWithinBounds");
    expect(getObjectivesForStrategy(model, "candidate-strategy").map((objective) => objective.id)).toEqual(["limit-burning"]);
    expect(listConstraints(model)).toHaveLength(1);
    expect(getConstraint(model, "one-cell-budget")?.constraintKind).toBe("budget");
    expect(getConstraintsForStrategy(model, "candidate-strategy").map((constraint) => constraint.id)).toEqual(["one-cell-budget"]);
    expect(listPolicies(model)).toHaveLength(1);
    expect(getPolicy(model, "if-burning-then-ignite")?.policyKind).toBe("ifThen");
    expect(getPoliciesForStrategy(model, "candidate-strategy").map((policy) => policy.id)).toEqual(["if-burning-then-ignite"]);
    expect(listStoppingRules(model)).toHaveLength(1);
    expect(getStoppingRule(model, "stop-at-tick")?.stoppingKind).toBe("timeLimit");
    expect(getStoppingRulesForStrategy(model, "candidate-strategy").map((rule) => rule.id)).toEqual(["stop-at-tick"]);
    expect(listExpectedEffects(model)).toHaveLength(1);
    expect(getExpectedEffect(model, "burning-decrease")?.effectKind).toBe("decrease");
    expect(getExpectedEffectsForStrategy(model, "candidate-strategy").map((effect) => effect.id)).toEqual(["burning-decrease"]);
    expect(modelHasPlannedStrategies(model)).toBe(true);
    expect(modelHasTemplateInterventionReferences(model)).toBe(true);
    expect(modelHasExternallyValidatedStrategies(model)).toBe(true);
    expect(summarizeControlStrategyModel(model)).toMatchObject({
      id: "control-model",
      strategyCount: 6,
      activeStrategyCount: 1,
      interventionCount: 2,
      activeInterventionCount: 1,
      triggerCount: 1,
      objectiveCount: 1,
      constraintCount: 1,
      policyCount: 1,
      stoppingRuleCount: 1,
      expectedEffectCount: 1,
      candidateCount: 1,
      plannedCount: 1,
      observedInModelOutputCount: 1,
      internallyTestedCount: 1,
      externallyValidatedCount: 1,
      rejectedCount: 1,
      executableCount: 0
    });
    expect(listInterventions(controlModel())).toEqual([]);
    expect(getIntervention(controlModel(), "missing")).toBeUndefined();
    expect(getInterventionsForStrategy(controlModel(), "candidate-strategy")).toEqual([]);
    expect(JSON.stringify(model)).toBe(before);
    const returned = listStrategies(model)[0] as StrategyDescriptor;
    (returned as { label: string }).label = "Mutated";
    expect(listStrategies(model)[0]?.label).toBe("Candidate Strategy");
  });

  it("serializes only control strategy artifacts and rejects other artifact families", () => {
    const model = fullControlModel();
    const json = serializeControlStrategyModel(model);
    expect(json).toContain(`"artifactType": "${controlStrategyModelArtifactType}"`);
    expect(deserializeControlStrategyModel(json)).toMatchObject({ id: "control-model", artifactType: controlStrategyModelArtifactType });
    for (const artifactType of [
      "ortus.scenario",
      snapshotArtifactType,
      uncertaintyConfigArtifactType,
      uncertaintyResultArtifactType,
      "ortus.assumptionProfile",
      networkDefinitionArtifactType,
      networkMetricsArtifactType,
      resourceSystemArtifactType,
      resourceMetricsArtifactType,
      eventScheduleArtifactType,
      delayQueueArtifactType,
      feedbackLoopsArtifactType,
      feedbackEventMetricsArtifactType,
      hybridCompositionArtifactType,
      scaleModelArtifactType,
      scaleViewStateArtifactType,
      boundaryModelArtifactType,
      fieldLayerArtifactType,
      observabilityModelArtifactType,
      causalAssumptionModelArtifactType,
      quantitySemanticsModelArtifactType,
      emergencePatternModelArtifactType,
      robustnessResilienceModelArtifactType
    ]) {
      expect(() => deserializeControlStrategyModel(JSON.stringify({ schemaVersion: "1", artifactType }))).toThrow(/artifact type/);
    }
    expect(() => deserializeControlStrategyModel(JSON.stringify({ schemaVersion: "1", artifactType: controlStrategyModelArtifactType }))).toThrow(
      /Invalid control strategy model/
    );
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { activeEngine: {} } }))).toThrow(/live-state|executable/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { dataset: [{ tick: 1, value: 2 }] } }))).toThrow(/dataset/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { timeSeries: [{ tick: 1, value: 2 }] } }))).toThrow(/timeSeries/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { metricHistory: [] } }))).toThrow(/metricHistory/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { formula: "x + y" } }))).toThrow(/formula/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { algorithm: "search" } }))).toThrow(/algorithm/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { optimizer: "best" } }))).toThrow(/optimizer/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { controller: "pid" } }))).toThrow(/controller/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { policyEngine: "executor" } }))).toThrow(/policyEngine/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { reinforcementLearning: {} } }))).toThrow(/reinforcementLearning/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { modelPredictiveControl: {} } }))).toThrow(/modelPredictiveControl/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { causalEffect: 0.2 } }))).toThrow(/causalEffect/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { treatmentEffect: 0.2 } }))).toThrow(/treatmentEffect/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { policyRecommendation: "act" } }))).toThrow(/policyRecommendation/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { recommendedAction: "act" } }))).toThrow(/recommendedAction/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { actionRanking: [] } }))).toThrow(/actionRanking/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { rankedPolicies: [] } }))).toThrow(/rankedPolicies/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { riskScore: 0.2 } }))).toThrow(/riskScore/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { safetyScore: 0.9 } }))).toThrow(/safetyScore/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { significance: true } }))).toThrow(/significance/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { certification: "safe" } }))).toThrow(/certification/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { experimentResults: [] } }))).toThrow(/experimentResults/);
    expect(() => deserializeControlStrategyModel(JSON.stringify({ ...model, metadata: { interventionResults: [] } }))).toThrow(/interventionResults/);
    expect(() => deserializeControlStrategyModel({ ...model, metadata: { callback: () => null } })).toThrow(
      /plain JSON|Invalid control strategy model|executable-shaped/
    );
  });

  it("updates registry and template capabilities without making templates strategy-runtime capable", () => {
    expect(getPrimitive("interventionStrategy")).toMatchObject({ status: "serviceOnly", supportLevel: "service" });
    expect(getPrimitive("interventionStrategy")?.limitations.join(" ")).toContain("No runtime policy execution");
    expect(listServiceOnlyPrimitives().map((primitive) => primitive.id)).toContain("interventionStrategy");
    expect(listReservedPrimitives().map((primitive) => primitive.id)).not.toContain("interventionStrategy");
    expect(getArtifactFamily(controlStrategyModelArtifactType)).toMatchObject({
      primitiveId: "interventionStrategy",
      implemented: true,
      importSupported: true,
      exportSupported: true,
      serviceOnly: true
    });
    expect(getPrimitive("validationCalibration")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("visualModelBuilder")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("externalFrameworkInterop")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("modelDefinitionSchema")).toMatchObject({ status: "reserved" });
    expect(getPrimitive("safeInterpreterCompiler")).toMatchObject({ status: "reserved" });
    for (const template of productionTemplates) {
      expect(getTemplateCapability(template.id, "interventionStrategy")).toMatchObject({
        status: "unsupported",
        runtimeActive: false,
        serviceAvailable: true
      });
      expect(getTemplateCapability(template.id, "validationCalibration")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "visualModelBuilder")).toMatchObject({ status: "unsupported", runtimeActive: false });
      expect(getTemplateCapability(template.id, "modelDefinitionSchema")).toMatchObject({ status: "unsupported", runtimeActive: false });
    }
  });

  it("keeps interventions, robustness, causality, observability, resources, templates, visuals, and metrics distinct from strategy proof", () => {
    const template = productionTemplateMap["forest-fire"];
    const scenario = createDefaultScenario({ template, scenarioId: "forest-control-distinction", seed: "forest-control", now: "2026-05-20T12:00:00.000Z" });
    const { engine } = createEngineFromScenario(scenario);
    engine.runSteps(2);
    const latestMetrics = engine.createSnapshot().metricsHistory.at(-1)?.values;
    expect(latestMetrics?.burningFraction).toBeDefined();
    expect(getInterventionDefinition("forest-fire", "forestFire.igniteCell")).toBeDefined();
    expect(getTemplateCapability("forest-fire", "interventionStrategy")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    expect(getTemplateCapability("forest-fire", "robustnessResilience")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "observability")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "causalAssumptions")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "unitsDimensionalConsistency")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "resources")).toMatchObject({ runtimeActive: false });
    expect(getTemplateCapability("forest-fire", "feedbackEvents")).toMatchObject({ runtimeActive: false });

    const profileText = JSON.stringify(template.assumptionProfile).toLowerCase();
    expect(profileText).toContain("template-owned interventions are not general strategy/control support");
    expect(profileText).toContain("visual patterns and metric traces are model outputs, not empirical evidence that a strategy works");
    expect(profileText).toContain("forest-fire ignite-cell is an abstract template intervention, not wildfire management guidance");
    expect(profileText).not.toContain("optimal strategy");
    expect(profileText).not.toContain("certified safe");

    for (const productionTemplate of productionTemplates) {
      expect(getTemplateCapability(productionTemplate.id, "interventionStrategy")).toMatchObject({ runtimeActive: false, serviceAvailable: true });
    }

    const warnings = getControlStrategyWarnings(fullControlModel()).join(" ");
    expect(warnings).toMatch(/uncertainty does not prove strategy effectiveness/);
    expect(warnings).toMatch(/robustness descriptors do not prove a strategy is robust/);
    expect(warnings).toMatch(/causal assumptions do not prove intervention effects/);
    expect(warnings).toMatch(/measurement structure does not monitor or control anything at runtime/);
    expect(warnings).toMatch(/units do not validate control objectives/);
    expect(warnings).toMatch(/attached primitives are not controlled at runtime/);
    expect(warnings).toMatch(/ControlStrategyModel does not execute template interventions/);
  });

  it("keeps control composition references structural and non-runnable for runtime requirements", () => {
    const report = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "control-ref",
            primitiveId: "interventionStrategy",
            attachmentType: "controlStrategyModel",
            mode: "reference",
            artifactType: controlStrategyModelArtifactType,
            artifactId: "control-1",
            active: true,
            required: true
          }
        ],
        requiredCapabilities: [{ primitiveId: "interventionStrategy", requiredSupportLevel: "runtime" }]
      })
    );
    expect(report.valid).toBe(true);
    expect(report.runnableNow).toBe(false);
    expect(report.missingCapabilities.map((missing) => missing.primitiveId)).toContain("interventionStrategy");

    const validationRequirement = validateCompositionCapabilities(
      composition({
        primitiveAttachments: [
          {
            id: "control-ref",
            primitiveId: "interventionStrategy",
            attachmentType: "controlStrategyModel",
            mode: "reference",
            artifactType: controlStrategyModelArtifactType,
            artifactId: "control-1",
            active: true,
            required: false
          }
        ],
        requiredCapabilities: [{ primitiveId: "validationCalibration", requiredSupportLevel: "metadata" }]
      })
    );
    expect(validationRequirement.runnableNow).toBe(false);
    expect(validationRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("validationCalibration");

    const schemaRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "modelDefinitionSchema", requiredSupportLevel: "metadata" }]
      })
    );
    expect(schemaRequirement.runnableNow).toBe(false);
    expect(schemaRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("modelDefinitionSchema");

    const visualRequirement = validateCompositionCapabilities(
      composition({
        requiredCapabilities: [{ primitiveId: "visualModelBuilder", requiredSupportLevel: "metadata" }]
      })
    );
    expect(visualRequirement.runnableNow).toBe(false);
    expect(visualRequirement.missingCapabilities.map((missing) => missing.primitiveId)).toContain("visualModelBuilder");
  });

  it("documents control boundaries and keeps services headless", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "roadmap.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "missing-pillars.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.");
    expect(docs).toContain("Template-owned runtime interventions are not the same as general strategy/control support.");
    expect(docs).toContain("Active policies, triggers, and objectives are structural declarations, not runtime-executed control loops.");
    expect(docs).toContain("Do not treat template-owned interventions as general strategy/control support.");
    expect(docs).toContain("Do not mark templates controlStrategy/interventionStrategy-capable unless runtime uses `ControlStrategyModel`.");
    expect(docs).toContain("ORTUS has completed Prompt 38B");
    expect(docs).toContain("Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.");
    expect(docs).toContain("This fit report may be stale because the schema changed after it was generated. Refresh the report before using it.");
    expect(docs).toContain("Model Schema Authoring Forms V1 creates structural model-schema artifacts; it does not execute schemas.");
    expect(docs).toContain("Rule declarations authored in the Builder are descriptive only and remain non-executable.");
    expect(docs).toContain("Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges.");
    expect(docs).toContain(
      "Runtime interpreter/compiler, runnable visual model builder support, external framework interop, generic social-learning runtime outside the narrow Opinion Dynamics behavior mode, full human cognition, LLM-per-agent runtime, validation, and calibration remain future work."
    );
    expect(docs).toContain("Workspace nodes and edges are visual descriptors, not executable dataflow or runtime behavior.");

    const controlDir = join(repoRoot, "src", "simulation", "control");
    const source = readdirSync(controlDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readFileSync(join(controlDir, file), "utf8"))
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
    expect(source).not.toMatch(/from ["'][^"']*\/(renderer|components|app|experiments|interventions|runs|optimization|statistics|significance|risk|safety|calibration|mcmc|filter|kalman|particle|compiler|visualBuilder)(\/|["'])/);
  });
});
