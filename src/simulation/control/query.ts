import { validateControlStrategyModel } from "./validation";
import type {
  ConstraintDefinition,
  ControlStrategyModel,
  ControlStrategySummary,
  ExpectedEffect,
  InterventionOption,
  ObjectiveDefinition,
  PolicyRule,
  StoppingRule,
  StrategyDescriptor,
  StrategyKind,
  StrategyStatus,
  TriggerCondition
} from "./types";
import { maxControlWarnings } from "./types";

export function listStrategies(model: ControlStrategyModel): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies);
}

export function listActiveStrategies(model: ControlStrategyModel): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies.filter((strategy) => strategy.active));
}

export function getStrategy(model: ControlStrategyModel, strategyId: string): StrategyDescriptor | undefined {
  const strategy = validateControlStrategyModel(model).strategies.find((candidate) => candidate.id === strategyId);
  return strategy ? clone(strategy) : undefined;
}

export function listStrategiesByKind(model: ControlStrategyModel, strategyKind: StrategyKind): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies.filter((strategy) => strategy.strategyKind === strategyKind));
}

export function listStrategiesByStatus(model: ControlStrategyModel, status: StrategyStatus): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies.filter((strategy) => strategy.status === status));
}

export function listCandidateStrategies(model: ControlStrategyModel): readonly StrategyDescriptor[] {
  return clone(
    validateControlStrategyModel(model).strategies.filter((strategy) => strategy.status === "candidate" || strategy.status === "hypothesized")
  );
}

export function listPlannedStrategies(model: ControlStrategyModel): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies.filter((strategy) => strategy.status === "planned"));
}

export function listObservedStrategies(model: ControlStrategyModel): readonly StrategyDescriptor[] {
  return clone(validateControlStrategyModel(model).strategies.filter((strategy) => strategy.status === "observedInModelOutput"));
}

export function listInterventions(model: ControlStrategyModel): readonly InterventionOption[] {
  return clone(validateControlStrategyModel(model).interventions ?? []);
}

export function listActiveInterventions(model: ControlStrategyModel): readonly InterventionOption[] {
  return clone((validateControlStrategyModel(model).interventions ?? []).filter((intervention) => intervention.active));
}

export function getIntervention(model: ControlStrategyModel, interventionId: string): InterventionOption | undefined {
  const intervention = validateControlStrategyModel(model).interventions?.find((candidate) => candidate.id === interventionId);
  return intervention ? clone(intervention) : undefined;
}

export function getInterventionsForStrategy(model: ControlStrategyModel, strategyId: string): readonly InterventionOption[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.interventionIds ?? []);
  return clone((valid.interventions ?? []).filter((intervention) => ids.has(intervention.id)));
}

export function listTriggers(model: ControlStrategyModel): readonly TriggerCondition[] {
  return clone(validateControlStrategyModel(model).triggers ?? []);
}

export function getTrigger(model: ControlStrategyModel, triggerId: string): TriggerCondition | undefined {
  const trigger = validateControlStrategyModel(model).triggers?.find((candidate) => candidate.id === triggerId);
  return trigger ? clone(trigger) : undefined;
}

export function getTriggersForStrategy(model: ControlStrategyModel, strategyId: string): readonly TriggerCondition[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.triggerIds ?? []);
  return clone((valid.triggers ?? []).filter((trigger) => ids.has(trigger.id)));
}

export function listObjectives(model: ControlStrategyModel): readonly ObjectiveDefinition[] {
  return clone(validateControlStrategyModel(model).objectives ?? []);
}

export function getObjective(model: ControlStrategyModel, objectiveId: string): ObjectiveDefinition | undefined {
  const objective = validateControlStrategyModel(model).objectives?.find((candidate) => candidate.id === objectiveId);
  return objective ? clone(objective) : undefined;
}

export function getObjectivesForStrategy(model: ControlStrategyModel, strategyId: string): readonly ObjectiveDefinition[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.objectiveIds ?? []);
  return clone((valid.objectives ?? []).filter((objective) => ids.has(objective.id)));
}

export function listConstraints(model: ControlStrategyModel): readonly ConstraintDefinition[] {
  return clone(validateControlStrategyModel(model).constraints ?? []);
}

export function getConstraint(model: ControlStrategyModel, constraintId: string): ConstraintDefinition | undefined {
  const constraint = validateControlStrategyModel(model).constraints?.find((candidate) => candidate.id === constraintId);
  return constraint ? clone(constraint) : undefined;
}

export function getConstraintsForStrategy(model: ControlStrategyModel, strategyId: string): readonly ConstraintDefinition[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.constraintIds ?? []);
  return clone((valid.constraints ?? []).filter((constraint) => ids.has(constraint.id)));
}

export function listPolicies(model: ControlStrategyModel): readonly PolicyRule[] {
  return clone(validateControlStrategyModel(model).policies ?? []);
}

export function getPolicy(model: ControlStrategyModel, policyId: string): PolicyRule | undefined {
  const policy = validateControlStrategyModel(model).policies?.find((candidate) => candidate.id === policyId);
  return policy ? clone(policy) : undefined;
}

export function getPoliciesForStrategy(model: ControlStrategyModel, strategyId: string): readonly PolicyRule[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.policyIds ?? []);
  return clone((valid.policies ?? []).filter((policy) => ids.has(policy.id)));
}

export function listStoppingRules(model: ControlStrategyModel): readonly StoppingRule[] {
  return clone(validateControlStrategyModel(model).stoppingRules ?? []);
}

export function getStoppingRule(model: ControlStrategyModel, stoppingRuleId: string): StoppingRule | undefined {
  const stoppingRule = validateControlStrategyModel(model).stoppingRules?.find((candidate) => candidate.id === stoppingRuleId);
  return stoppingRule ? clone(stoppingRule) : undefined;
}

export function getStoppingRulesForStrategy(model: ControlStrategyModel, strategyId: string): readonly StoppingRule[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.stoppingRuleIds ?? []);
  return clone((valid.stoppingRules ?? []).filter((rule) => ids.has(rule.id)));
}

export function listExpectedEffects(model: ControlStrategyModel): readonly ExpectedEffect[] {
  return clone(validateControlStrategyModel(model).expectedEffects ?? []);
}

export function getExpectedEffect(model: ControlStrategyModel, expectedEffectId: string): ExpectedEffect | undefined {
  const expectedEffect = validateControlStrategyModel(model).expectedEffects?.find((candidate) => candidate.id === expectedEffectId);
  return expectedEffect ? clone(expectedEffect) : undefined;
}

export function getExpectedEffectsForStrategy(model: ControlStrategyModel, strategyId: string): readonly ExpectedEffect[] {
  const valid = validateControlStrategyModel(model);
  const strategy = valid.strategies.find((candidate) => candidate.id === strategyId);
  const ids = new Set(strategy?.expectedEffectIds ?? []);
  return clone((valid.expectedEffects ?? []).filter((effect) => ids.has(effect.id)));
}

export function modelHasPlannedStrategies(model: ControlStrategyModel): boolean {
  return validateControlStrategyModel(model).strategies.some((strategy) => strategy.status === "planned");
}

export function modelHasTemplateInterventionReferences(model: ControlStrategyModel): boolean {
  return (validateControlStrategyModel(model).interventions ?? []).some((intervention) => intervention.interventionKind === "templateInterventionReference");
}

export function modelHasExternallyValidatedStrategies(model: ControlStrategyModel): boolean {
  return validateControlStrategyModel(model).strategies.some((strategy) => strategy.status === "externallyValidated");
}

export function summarizeControlStrategyModel(model: ControlStrategyModel): ControlStrategySummary {
  const valid = validateControlStrategyModel(model);
  return {
    id: valid.id,
    name: valid.name,
    strategyCount: valid.strategies.length,
    activeStrategyCount: valid.strategies.filter((strategy) => strategy.active).length,
    interventionCount: (valid.interventions ?? []).length,
    activeInterventionCount: (valid.interventions ?? []).filter((intervention) => intervention.active).length,
    triggerCount: (valid.triggers ?? []).length,
    objectiveCount: (valid.objectives ?? []).length,
    constraintCount: (valid.constraints ?? []).length,
    policyCount: (valid.policies ?? []).length,
    stoppingRuleCount: (valid.stoppingRules ?? []).length,
    expectedEffectCount: (valid.expectedEffects ?? []).length,
    candidateCount: valid.strategies.filter((strategy) => strategy.status === "candidate").length,
    plannedCount: valid.strategies.filter((strategy) => strategy.status === "planned").length,
    observedInModelOutputCount: valid.strategies.filter((strategy) => strategy.status === "observedInModelOutput").length,
    internallyTestedCount: valid.strategies.filter((strategy) => strategy.status === "internallyTested").length,
    externallyValidatedCount: valid.strategies.filter((strategy) => strategy.status === "externallyValidated").length,
    rejectedCount: valid.strategies.filter((strategy) => strategy.status === "rejected").length,
    executableCount: 0,
    warnings: getControlStrategyWarnings(valid)
  };
}

export function validateControlStrategyModelForRuntime(model: ControlStrategyModel) {
  const valid = validateControlStrategyModel(model);
  return {
    modelId: valid.id,
    valid: true,
    runnableNow: false,
    errors: [],
    warnings: [
      "Strategy and control descriptors declare intervention semantics; they do not execute or prove strategies.",
      ...getControlStrategyWarnings(valid)
    ],
    missingCapabilities: [
      {
        primitiveId: "interventionStrategy" as const,
        requiredSupportLevel: "runtime" as const,
        reason:
          "Strategy/Control V1 is structural only; current templates do not execute ControlStrategyModel policies, triggers, objectives, stopping rules, template intervention references, optimization, validation, or calibration."
      }
    ]
  };
}

export function getControlStrategyWarnings(model: ControlStrategyModel): readonly string[] {
  const valid = validateControlStrategyModel(model);
  const warnings: string[] = [];

  for (const strategy of valid.strategies) {
    if (strategy.status === "externallyValidated" && !strategy.notes?.length && !valid.validationNotes?.length) {
      warnings.push(`Strategy ${strategy.id} is externallyValidated without validation or provenance notes.`);
    }
    if (strategy.status === "observedInModelOutput") {
      warnings.push(`Strategy ${strategy.id} is observedInModelOutput; model output is not real-world strategy validation.`);
    }
    if (strategy.status === "internallyTested") {
      warnings.push(`Strategy ${strategy.id} is internallyTested; internal checks are software/model checks, not empirical validation.`);
    }
    if (strategy.status === "planned") {
      warnings.push(`Strategy ${strategy.id} is planned; no strategy or policy is executed by this descriptor.`);
    }
    if (strategy.status === "candidate" || strategy.status === "hypothesized") {
      warnings.push(`Strategy ${strategy.id} is ${strategy.status}; strategy effectiveness is not confirmed.`);
    }
    if (strategy.status !== "externallyValidated" && strategyClaimsBroadApplicability(strategy)) {
      warnings.push(`Strategy ${strategy.id} uses broad-applicability language without external validation; V1 does not validate real-world strategy effectiveness.`);
    }
    if (strategy.active) {
      warnings.push(`Active strategy ${strategy.id} is structural only and is not runtime-executed.`);
    }
    if (!strategy.interventionIds?.length) {
      warnings.push(`Strategy ${strategy.id} has no intervention references.`);
    }
    if (!strategy.objectiveIds?.length) {
      warnings.push(`Strategy ${strategy.id} has no objective references.`);
    }
    if (!strategy.targetDescription) {
      warnings.push(`Strategy ${strategy.id} has no targetDescription.`);
    }
    if (strategy.strategyKind === "feedbackControl" || strategy.strategyKind === "closedLoopControl") {
      warnings.push(`Strategy ${strategy.id} is ${strategy.strategyKind}; no runtime control loop exists in V1.`);
    }
    if (strategy.strategyKind === "adaptiveStrategy") {
      warnings.push(`Strategy ${strategy.id} is adaptiveStrategy; no learning or adaptation is executed in V1.`);
    }
  }

  for (const intervention of valid.interventions ?? []) {
    if (intervention.active) {
      warnings.push(`Active intervention ${intervention.id} is structural only and is not executed by this model.`);
    }
    if (!intervention.targetPath && !intervention.templateInterventionId && !intervention.targetDescription) {
      warnings.push(`Intervention ${intervention.id} has no targetPath, templateInterventionId, or targetDescription.`);
    }
    if (!intervention.magnitudeDescription && !intervention.timingDescription && !intervention.durationDescription) {
      warnings.push(`Intervention ${intervention.id} has no magnitude, timing, or duration description.`);
    }
    if (intervention.interventionKind === "templateInterventionReference") {
      warnings.push(`Intervention ${intervention.id} references a template intervention structurally; ControlStrategyModel does not execute template interventions.`);
    }
  }

  for (const trigger of valid.triggers ?? []) {
    if (trigger.active) {
      warnings.push(`Active trigger ${trigger.id} is structural only and is not monitored at runtime.`);
    }
    if (!trigger.metricId && !trigger.observationId && !trigger.eventType && !trigger.quantityId) {
      warnings.push(`Trigger ${trigger.id} has no metric, observation, event, or quantity reference.`);
    }
  }

  for (const objective of valid.objectives ?? []) {
    if (objective.active) {
      warnings.push(`Active objective ${objective.id} is structural only and is not optimized or evaluated.`);
    }
    if (!objective.metricId && !objective.quantityId) {
      warnings.push(`Objective ${objective.id} has no metricId or quantityId.`);
    }
    if (objective.priorityDescription) {
      warnings.push(`Objective ${objective.id} priorityDescription is descriptive only and is not optimized.`);
    }
  }

  for (const constraint of valid.constraints ?? []) {
    if (constraint.active) {
      warnings.push(`Active constraint ${constraint.id} is structural only and is not enforced.`);
    }
    if (constraint.hardConstraint) {
      warnings.push(`Constraint ${constraint.id} is marked hardConstraint, but constraints are not enforced in V1.`);
    }
    if (constraint.constraintKind === "safety" || constraint.constraintKind === "ethical") {
      warnings.push(`Constraint ${constraint.id} is ${constraint.constraintKind}; declaration is not certification or enforcement.`);
    }
  }

  for (const policy of valid.policies ?? []) {
    if (policy.active) {
      warnings.push(`Active policy ${policy.id} is structural only and is not executed.`);
    }
    warnings.push(`Policy ${policy.id} ruleDescription is descriptive text; it is not parsed or executed.`);
    if (!policy.triggerIds?.length && !policy.interventionIds?.length) {
      warnings.push(`Policy ${policy.id} has no trigger or intervention references.`);
    }
  }

  for (const rule of valid.stoppingRules ?? []) {
    if (rule.active) {
      warnings.push(`Active stopping rule ${rule.id} is structural only and is not enforced.`);
    }
    warnings.push(`Stopping rule ${rule.id} is a structural declaration and is not enforced at runtime.`);
  }

  for (const effect of valid.expectedEffects ?? []) {
    if (effect.active) {
      warnings.push(`Active expected effect ${effect.id} is structural only and is not measured or guaranteed.`);
    }
    if (!effect.evidenceDescription && !effect.uncertaintyDescription && !effect.riskDescription) {
      warnings.push(`Expected effect ${effect.id} has no evidence, uncertainty, or risk description.`);
    }
    if (effect.evidenceDescription) {
      warnings.push(`Expected effect ${effect.id} evidenceDescription is documentation only, not proof or a measured effect.`);
    }
  }

  if (valid.scope?.uncertaintyConfigId || valid.scope?.uncertaintyResultId) {
    warnings.push("Control scope references uncertainty; uncertainty does not prove strategy effectiveness.");
  }
  if (valid.scope?.robustnessResilienceModelId) {
    warnings.push("Control scope references robustness descriptors; robustness descriptors do not prove a strategy is robust.");
  }
  if (valid.scope?.emergencePatternModelId) {
    warnings.push("Control scope references emergence descriptors; pattern descriptors do not validate strategies.");
  }
  if (valid.scope?.causalAssumptionModelId) {
    warnings.push("Control scope references causal assumptions; causal assumptions do not prove intervention effects.");
  }
  if (valid.scope?.observabilityModelId) {
    warnings.push("Control scope references observability; measurement structure does not monitor or control anything at runtime.");
  }
  if (valid.scope?.quantitySemanticsModelId) {
    warnings.push("Control scope references quantity semantics; units do not validate control objectives.");
  }
  if (valid.scope?.resourceSystemId || valid.scope?.feedbackLoopModelId || valid.scope?.networkDefinitionId || valid.scope?.boundaryModelId) {
    warnings.push("Control scope references resource/feedback/network/boundary structure; attached primitives are not controlled at runtime.");
  }
  if (valid.scope?.templateId === "forest-fire") {
    warnings.push("Forest-fire intervention or control descriptors are abstract model metadata, not wildfire management guidance.");
  }

  return warnings.slice(0, maxControlWarnings);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function strategyClaimsBroadApplicability(strategy: StrategyDescriptor): boolean {
  const text = JSON.stringify({
    targetDescription: strategy.targetDescription,
    notes: strategy.notes,
    metadata: strategy.metadata
  }).toLowerCase();
  return /\bbroad applicability\b|\bgeneraliz|\breal-world\b|\breal world\b|\boperational\b|\bproduction\b|\bsafety\b|\bcertif|\boptimal\b/.test(text);
}
