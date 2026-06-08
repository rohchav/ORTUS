import { assumptionProfileArtifactType } from "../assumptions/types";
import { boundaryModelArtifactType } from "../boundaries/types";
import { causalAssumptionModelArtifactType } from "../causality/types";
import { controlStrategyModelArtifactType } from "../control/types";
import { emergencePatternModelArtifactType } from "../emergence/types";
import { hybridCompositionArtifactType } from "../composition/types";
import { modelSchemaArtifactType } from "../modelSchema/types";
import { schemaTemplateCompatibilityReportArtifactType, templateMappingProfileArtifactType } from "../schemaTemplateCompatibility/types";
import { knowledgeMemorySocialLearningArtifactType } from "../socialLearning/types";
import { visualBuilderWorkspaceArtifactType } from "../visualBuilderWorkspace/types";
import {
  delayQueueArtifactType,
  eventScheduleArtifactType,
  feedbackEventMetricsArtifactType,
  feedbackLoopsArtifactType
} from "../feedback/types";
import { networkDefinitionArtifactType, networkMetricsArtifactType } from "../networks/types";
import { observabilityModelArtifactType } from "../observability/types";
import { quantitySemanticsModelArtifactType } from "../quantities/types";
import { robustnessResilienceModelArtifactType } from "../robustness/types";
import { scaleModelArtifactType } from "../multiscale/types";
import { resourceMetricsArtifactType, resourceSystemArtifactType } from "../resources/types";
import { scenarioArtifactType } from "../scenarios/scenarioTypes";
import { scaleViewStateArtifactType } from "../scaleView/types";
import { fieldLayerArtifactType } from "../spatialFields/types";
import { uncertaintyConfigArtifactType, uncertaintyResultArtifactType } from "../uncertainty/types";
import type { ArtifactFamilyEntry } from "./types";

export const snapshotArtifactType = "ortus.snapshot";

const rejectAgainstModelingArtifacts = [
  scenarioArtifactType,
  snapshotArtifactType,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  assumptionProfileArtifactType,
  networkDefinitionArtifactType,
  networkMetricsArtifactType,
  resourceSystemArtifactType,
  resourceMetricsArtifactType,
  eventScheduleArtifactType,
  delayQueueArtifactType,
  feedbackLoopsArtifactType,
  feedbackEventMetricsArtifactType,
  hybridCompositionArtifactType,
  modelSchemaArtifactType,
  knowledgeMemorySocialLearningArtifactType,
  visualBuilderWorkspaceArtifactType,
  schemaTemplateCompatibilityReportArtifactType,
  templateMappingProfileArtifactType,
  scaleModelArtifactType,
  scaleViewStateArtifactType,
  boundaryModelArtifactType,
  fieldLayerArtifactType,
  observabilityModelArtifactType,
  causalAssumptionModelArtifactType,
  quantitySemanticsModelArtifactType,
  emergencePatternModelArtifactType,
  robustnessResilienceModelArtifactType,
  controlStrategyModelArtifactType
] as const;

export const artifactFamilyRegistry: readonly ArtifactFamilyEntry[] = [
  {
    id: "scenario",
    artifactType: scenarioArtifactType,
    primitiveId: "scenarios",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: false,
    description: "Authored fresh-run scenario recipe; distinct from snapshots and run summaries.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== scenarioArtifactType)
  },
  {
    id: "snapshot",
    artifactType: snapshotArtifactType,
    primitiveId: "snapshots",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: false,
    description: "Engine snapshot family for exact deterministic restore; current engine snapshot payloads do not use a top-level artifactType field.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== snapshotArtifactType)
  },
  {
    id: "uncertaintyConfig",
    artifactType: uncertaintyConfigArtifactType,
    primitiveId: "uncertainty",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless uncertainty sampling configuration.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== uncertaintyConfigArtifactType)
  },
  {
    id: "uncertaintyResult",
    artifactType: uncertaintyResultArtifactType,
    primitiveId: "uncertainty",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless uncertainty result summary artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== uncertaintyResultArtifactType)
  },
  {
    id: "assumptionProfile",
    artifactType: assumptionProfileArtifactType,
    primitiveId: "assumptions",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Structured assumptions, limitations, use-boundaries, ethics notes, and validation-status metadata.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== assumptionProfileArtifactType)
  },
  {
    id: "networkDefinition",
    artifactType: networkDefinitionArtifactType,
    primitiveId: "networks",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless network definition artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== networkDefinitionArtifactType)
  },
  {
    id: "networkMetrics",
    artifactType: networkMetricsArtifactType,
    primitiveId: "networks",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless network structural metrics artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== networkMetricsArtifactType)
  },
  {
    id: "resourceSystem",
    artifactType: resourceSystemArtifactType,
    primitiveId: "resources",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless resource, stock, flow, stock-state, and bounded-ledger artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== resourceSystemArtifactType)
  },
  {
    id: "resourceMetrics",
    artifactType: resourceMetricsArtifactType,
    primitiveId: "resources",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless resource operation and stock metrics artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== resourceMetricsArtifactType)
  },
  {
    id: "eventSchedule",
    artifactType: eventScheduleArtifactType,
    primitiveId: "feedbackEvents",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless scheduled-event artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== eventScheduleArtifactType)
  },
  {
    id: "delayQueue",
    artifactType: delayQueueArtifactType,
    primitiveId: "feedbackEvents",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless delay queue artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== delayQueueArtifactType)
  },
  {
    id: "feedbackLoops",
    artifactType: feedbackLoopsArtifactType,
    primitiveId: "feedbackEvents",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless feedback-loop metadata artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== feedbackLoopsArtifactType)
  },
  {
    id: "feedbackEventMetrics",
    artifactType: feedbackEventMetricsArtifactType,
    primitiveId: "feedbackEvents",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless feedback, event, and delay metrics artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== feedbackEventMetricsArtifactType)
  },
  {
    id: "hybridComposition",
    artifactType: hybridCompositionArtifactType,
    primitiveId: "hybridComposition",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless hybrid composition artifact for structural primitive attachments and capability requirements.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== hybridCompositionArtifactType)
  },
  {
    id: "modelSchema",
    artifactType: modelSchemaArtifactType,
    primitiveId: "modelSchema",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless structural model schema artifact; no runtime interpreter, compiler, visual builder, or template generation.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== modelSchemaArtifactType)
  },
  {
    id: "knowledgeMemorySocialLearning",
    artifactType: knowledgeMemorySocialLearningArtifactType,
    primitiveId: "knowledgeMemorySocialLearning",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless structural knowledge, bounded-memory, belief, trust/source, exposure, and social-learning semantics artifact; no runtime social learning or human cognition.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== knowledgeMemorySocialLearningArtifactType)
  },
  {
    id: "visualBuilderWorkspace",
    artifactType: visualBuilderWorkspaceArtifactType,
    primitiveId: "visualBuilderWorkspace",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless visual builder workspace planning artifact; no visual builder UI, graph execution, schema execution, or model generation.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== visualBuilderWorkspaceArtifactType)
  },
  {
    id: "schemaTemplateCompatibilityReport",
    artifactType: schemaTemplateCompatibilityReportArtifactType,
    primitiveId: "schemaTemplateCompatibility",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless structural template/schema compatibility report; no conversion, generation, schema execution, validation, or calibration.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== schemaTemplateCompatibilityReportArtifactType)
  },
  {
    id: "templateMappingProfile",
    artifactType: templateMappingProfileArtifactType,
    primitiveId: "schemaTemplateCompatibility",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless static template mapping profile derived from template metadata; no template mutation or runtime support claim.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== templateMappingProfileArtifactType)
  },
  {
    id: "modelDefinition",
    artifactType: "ortus.modelDefinition",
    primitiveId: "modelDefinitionSchema",
    implemented: false,
    importSupported: false,
    exportSupported: false,
    serviceOnly: false,
    description: "Reserved future model definition artifact; not import/export supported."
  },
  {
    id: "scaleModel",
    artifactType: scaleModelArtifactType,
    primitiveId: "multiScale",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless multi-scale structural model artifact; no runtime aggregation/disaggregation or zoom UI.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== scaleModelArtifactType)
  },
  {
    id: "scaleViewState",
    artifactType: scaleViewStateArtifactType,
    primitiveId: "scaleAwareViews",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless scale view state artifact for model-scale navigation; no renderer rewrite or runtime scale execution.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== scaleViewStateArtifactType)
  },
  {
    id: "observabilityModel",
    artifactType: observabilityModelArtifactType,
    primitiveId: "observability",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless observability and measurement model artifact for structural variables, measurements, schedules, and measurement processes.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== observabilityModelArtifactType)
  },
  {
    id: "causalAssumptionModel",
    artifactType: causalAssumptionModelArtifactType,
    primitiveId: "causalAssumptions",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless causal assumption and influence structure artifact for structural variables, influences, assumptions, evidence items, and intervention relevance.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== causalAssumptionModelArtifactType)
  },
  {
    id: "quantitySemanticsModel",
    artifactType: quantitySemanticsModelArtifactType,
    primitiveId: "unitsDimensionalConsistency",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless units, dimensions, quantity semantics, ranges, and compatibility-rule artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== quantitySemanticsModelArtifactType)
  },
  {
    id: "emergencePatternModel",
    artifactType: emergencePatternModelArtifactType,
    primitiveId: "emergenceDetection",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless emergence pattern descriptor artifact for candidate patterns, signatures, thresholds, time windows, variables, and scale links.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== emergencePatternModelArtifactType)
  },
  {
    id: "robustnessResilienceModel",
    artifactType: robustnessResilienceModelArtifactType,
    primitiveId: "robustnessResilience",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless robustness, resilience, perturbation, stressor, response-criterion, failure-mode, and stress-test semantics artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== robustnessResilienceModelArtifactType)
  },
  {
    id: "controlStrategyModel",
    artifactType: controlStrategyModelArtifactType,
    primitiveId: "interventionStrategy",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless strategy, control, policy, intervention-option, trigger, objective, constraint, stopping-rule, and expected-effect semantics artifact.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== controlStrategyModelArtifactType)
  },
  {
    id: "boundaryModel",
    artifactType: boundaryModelArtifactType,
    primitiveId: "boundariesEnvironment",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless boundary/environment model artifact for structural scope, exchanges, external forcings, and shocks.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== boundaryModelArtifactType)
  },
  {
    id: "fieldLayer",
    artifactType: fieldLayerArtifactType,
    primitiveId: "spatialFields",
    implemented: true,
    importSupported: true,
    exportSupported: true,
    serviceOnly: true,
    description: "Headless spatial field and environmental layer artifact for structural coordinate spaces, fields, layers, and sampling metadata.",
    mustRejectAsOtherArtifactWhereApplicable: rejectAgainstModelingArtifacts.filter((type) => type !== fieldLayerArtifactType)
  },
  {
    id: "validationReport",
    artifactType: "ortus.validationReport",
    primitiveId: "validationCalibration",
    implemented: false,
    importSupported: false,
    exportSupported: false,
    serviceOnly: false,
    description: "Reserved future validation report artifact; not import/export supported."
  },
  {
    id: "traceReport",
    artifactType: "ortus.traceReport",
    primitiveId: "explainabilityTrace",
    implemented: false,
    importSupported: false,
    exportSupported: false,
    serviceOnly: false,
    description: "Reserved future trace report artifact; not import/export supported."
  },
  {
    id: "patternLibrary",
    artifactType: "ortus.patternLibrary",
    primitiveId: "patternLibraries",
    implemented: false,
    importSupported: false,
    exportSupported: false,
    serviceOnly: false,
    description: "Reserved future pattern library artifact; not import/export supported."
  },
  {
    id: "domainPack",
    artifactType: "ortus.domainPack",
    primitiveId: "domainPacks",
    implemented: false,
    importSupported: false,
    exportSupported: false,
    serviceOnly: false,
    description: "Reserved future domain pack artifact; not import/export supported."
  }
] as const;
