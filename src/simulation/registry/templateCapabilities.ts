import type { SimulationTemplate } from "../kernel/types";
import { productionTemplates } from "../templates/registry";
import { primitiveRegistry } from "./primitives";
import type { PrimitiveId, TemplatePrimitiveCapability } from "./types";

const globalServiceOnlyPrimitiveIds = new Set<PrimitiveId>([
  "uncertainty",
  "networks",
  "resources",
  "feedbackEvents",
  "hybridComposition",
  "multiScale",
  "scaleAwareViews",
  "boundariesEnvironment",
  "spatialFields",
  "observability",
  "causalAssumptions",
  "emergenceDetection",
  "robustnessResilience",
  "interventionStrategy",
  "unitsDimensionalConsistency",
  "modelSchema",
  "knowledgeMemorySocialLearning",
  "visualBuilderWorkspace",
  "schemaTemplateCompatibility"
]);
const reservedPrimitiveIds = new Set<PrimitiveId>(primitiveRegistry.filter((primitive) => primitive.status === "reserved").map((primitive) => primitive.id));

export function buildTemplatePrimitiveCapabilities(
  templates: readonly SimulationTemplate[] = productionTemplates
): readonly TemplatePrimitiveCapability[] {
  return templates.flatMap((template) => primitiveRegistry.map((primitive) => capabilityForTemplate(template, primitive.id)));
}

function capabilityForTemplate(template: SimulationTemplate, primitiveId: PrimitiveId): TemplatePrimitiveCapability {
  const capabilities = template.capabilities;

  switch (primitiveId) {
    case "scenarios":
      return runtimeCapability(template.id, primitiveId, Boolean(capabilities?.supportsScenarioBuilder), "Template can be configured by fresh-run scenarios.");
    case "snapshots":
      return runtimeCapability(template.id, primitiveId, Boolean(capabilities?.supportsSnapshotExport), "Template supports engine snapshot export and restore.");
    case "behaviorModes":
      return runtimeCapability(
        template.id,
        primitiveId,
        Boolean(capabilities?.supportsBehaviorModes && (template.behaviorModes?.length ?? 0) > 0),
        template.id === "flocking-boids"
          ? "Template behavior modes include classic and groupAware flocking; this is behavior-mode support, not adaptive agents or multi-scale modeling."
          : "Template exposes template-owned behavior mode definitions."
      );
    case "agentComposition":
      return runtimeCapability(
        template.id,
        primitiveId,
        Boolean(capabilities?.supportsAgentComposition && (template.agentCompositionDefinitions?.length ?? 0) > 0),
        "Template exposes bounded initialization composition fields."
      );
    case "uncertainty":
      return {
        templateId: template.id,
        primitiveId,
        status: capabilities?.supportsUncertaintyConfig ? "serviceOnly" : "unsupported",
        supportLevel: capabilities?.supportsUncertaintyConfig ? "service" : "none",
        runtimeActive: false,
        serviceAvailable: Boolean(capabilities?.supportsUncertaintyConfig),
        metadataAvailable: Boolean(capabilities?.supportsUncertaintyConfig),
        notes: "Uncertainty can sample validated safe parameters for fresh runs; it is not calibrated probability.",
        limitations: ["No template runtime uses uncertainty as an internal dynamic."]
      };
    case "assumptions":
      return {
        templateId: template.id,
        primitiveId,
        status: template.assumptionProfile ? "metadataOnly" : "unsupported",
        supportLevel: template.assumptionProfile ? "metadata" : "none",
        runtimeActive: false,
        serviceAvailable: Boolean(template.assumptionProfile),
        metadataAvailable: Boolean(template.assumptionProfile),
        notes: "Template exposes assumption-profile metadata; this is transparency metadata, not validation proof.",
        limitations: ["Assumption profiles do not affect engine dynamics."]
      };
    case "networks":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Network services exist globally, but this template does not use network topology at runtime."
      );
    case "resources":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Resource/stock/flow services exist globally, but this template does not use resource state at runtime."
      );
    case "feedbackEvents":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Feedback/event/delay services exist globally, but this template does not use them at runtime."
      );
    case "hybridComposition":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Hybrid composition services can reference this template, but the template runtime does not execute hybrid compositions."
      );
    case "multiScale":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Multi-scale services exist globally, but this template does not use explicit scale levels or cross-scale rules at runtime."
      );
    case "scaleAwareViews":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Scale-view services exist globally, but this template does not use model-scale view state at runtime."
      );
    case "boundariesEnvironment":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Boundary/environment services exist globally, but this template does not use BoundaryEnvironmentModel at runtime."
      );
    case "spatialFields":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Spatial field services exist globally, but this template does not use SpatialFieldModel at runtime."
      );
    case "observability":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Observability services exist globally, but this template does not use ObservabilityModel at runtime. Existing metrics are model outputs, not empirical observations."
      );
    case "causalAssumptions":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Causal-assumption services exist globally, but this template does not use CausalAssumptionModel at runtime. Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves."
      );
    case "unitsDimensionalConsistency":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Quantity-semantics services exist globally, but this template does not use QuantitySemanticsModel at runtime. Parameter labels, metric labels, and numeric bounds are not full unit and dimension semantics."
      );
    case "emergenceDetection":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Emergence-pattern services exist globally, but this template does not use EmergencePatternModel at runtime. Visual patterns, behavior modes, and runtime metrics are model outputs, not emergence proof."
      );
    case "robustnessResilience":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Robustness/resilience services exist globally, but this template does not use RobustnessResilienceModel at runtime. Metrics, visuals, uncertainty ensembles, and interventions are not general robustness testing."
      );
    case "interventionStrategy":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Strategy/control services exist globally, but this template does not use ControlStrategyModel at runtime. Template-owned interventions are not general strategy/control support."
      );
    case "modelSchema":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Model schema services exist globally, but this template is hand-built and does not use ModelSchemaDefinition at runtime."
      );
    case "knowledgeMemorySocialLearning":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Knowledge/memory/social-learning semantics services exist globally, but this template does not execute social-learning runtime, human cognition, or LLM agents."
      );
    case "visualBuilderWorkspace":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Visual builder workspace services exist globally, but this template is hand-built and does not use workspace schemas, node graphs, or visual-builder runtime."
      );
    case "schemaTemplateCompatibility":
      return unsupportedServiceCapability(
        template.id,
        primitiveId,
        "Template/schema compatibility services can structurally compare this template metadata with a model schema, but the template runtime does not execute compatibility reports or ModelSchemaDefinition artifacts."
      );
    default:
      if (reservedPrimitiveIds.has(primitiveId)) {
        return {
          templateId: template.id,
          primitiveId,
          status: "unsupported",
          supportLevel: "none",
          runtimeActive: false,
          serviceAvailable: false,
          metadataAvailable: false,
          notes:
            primitiveId === "socialLearningRuntime" && template.id === "opinion-dynamics"
              ? "Global socialLearningRuntime primitive remains reserved; Opinion has only a narrow template-owned socialLearning behavior mode, not global primitive support."
              : "Reserved future primitive; no current production template may claim global primitive support.",
          limitations: ["Prompt 19 records this as roadmap metadata only."]
        };
      }
      return {
        templateId: template.id,
        primitiveId,
        status: "unsupported",
        supportLevel: "none",
        runtimeActive: false,
        serviceAvailable: globalServiceOnlyPrimitiveIds.has(primitiveId),
        metadataAvailable: false,
        notes: "No current support is declared for this template.",
        limitations: ["No runtime behavior is active."]
      };
  }
}

function runtimeCapability(templateId: string, primitiveId: PrimitiveId, supported: boolean, notes: string): TemplatePrimitiveCapability {
  return {
    templateId,
    primitiveId,
    status: supported ? "implemented" : "unsupported",
    supportLevel: supported ? "runtime" : "none",
    runtimeActive: supported,
    serviceAvailable: supported,
    metadataAvailable: supported,
    notes,
    limitations: supported ? [] : ["Template does not declare this runtime capability."]
  };
}

function unsupportedServiceCapability(templateId: string, primitiveId: PrimitiveId, notes: string): TemplatePrimitiveCapability {
  return {
    templateId,
    primitiveId,
    status: "unsupported",
    supportLevel: "none",
    runtimeActive: false,
    serviceAvailable: true,
    metadataAvailable: true,
    notes,
    limitations: ["Global service availability is not template runtime support."]
  };
}

export const templatePrimitiveCapabilities: readonly TemplatePrimitiveCapability[] = buildTemplatePrimitiveCapabilities();
