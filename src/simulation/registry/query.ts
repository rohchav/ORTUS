import { artifactFamilyRegistry } from "./artifacts";
import { primitiveRegistry } from "./primitives";
import { templatePrimitiveCapabilities } from "./templateCapabilities";
import type {
  ArtifactFamilyEntry,
  ListTemplatesSupportingPrimitiveOptions,
  PrimitiveId,
  RoadmapPrimitivePhase,
  SystemsPrimitiveEntry,
  TemplatePrimitiveCapability
} from "./types";

const primitiveById = new Map<PrimitiveId, SystemsPrimitiveEntry>(primitiveRegistry.map((primitive) => [primitive.id, primitive]));
const artifactByType = new Map<string, ArtifactFamilyEntry>(artifactFamilyRegistry.map((artifact) => [artifact.artifactType, artifact]));

export function getPrimitive(id: PrimitiveId): SystemsPrimitiveEntry | undefined {
  const primitive = primitiveById.get(id);
  return primitive ? cloneRegistryValue(primitive) : undefined;
}

export function listPrimitives(): readonly SystemsPrimitiveEntry[] {
  return cloneRegistryValue(primitiveRegistry);
}

export function listImplementedPrimitives(): readonly SystemsPrimitiveEntry[] {
  return cloneRegistryValue(primitiveRegistry.filter((primitive) => primitive.status === "implemented"));
}

export function listServiceOnlyPrimitives(): readonly SystemsPrimitiveEntry[] {
  return cloneRegistryValue(primitiveRegistry.filter((primitive) => primitive.status === "serviceOnly"));
}

export function listReservedPrimitives(): readonly SystemsPrimitiveEntry[] {
  return cloneRegistryValue(primitiveRegistry.filter((primitive) => primitive.status === "reserved"));
}

export function listArtifactFamilies(): readonly ArtifactFamilyEntry[] {
  return cloneRegistryValue(artifactFamilyRegistry);
}

export function getArtifactFamily(artifactType: string): ArtifactFamilyEntry | undefined {
  const artifact = artifactByType.get(artifactType);
  return artifact ? cloneRegistryValue(artifact) : undefined;
}

export function listArtifactFamiliesForPrimitive(primitiveId: PrimitiveId): readonly ArtifactFamilyEntry[] {
  return cloneRegistryValue(artifactFamilyRegistry.filter((artifact) => artifact.primitiveId === primitiveId));
}

export function getTemplatePrimitiveCapabilities(templateId: string): readonly TemplatePrimitiveCapability[] {
  return cloneRegistryValue(templatePrimitiveCapabilities.filter((capability) => capability.templateId === templateId));
}

export function getTemplateCapability(templateId: string, primitiveId: PrimitiveId): TemplatePrimitiveCapability | undefined {
  const capability = templatePrimitiveCapabilities.find((entry) => entry.templateId === templateId && entry.primitiveId === primitiveId);
  return capability ? cloneRegistryValue(capability) : undefined;
}

export function listTemplatesSupportingPrimitive(
  primitiveId: PrimitiveId,
  options: ListTemplatesSupportingPrimitiveOptions = {}
): readonly TemplatePrimitiveCapability[] {
  const runtimeOnly = options.runtimeOnly ?? !(options.includeServiceOnly || options.includeMetadataOnly || options.includeUnsupportedWithGlobalService);
  const capabilities = templatePrimitiveCapabilities.filter((capability) => capability.primitiveId === primitiveId);
  const filtered = capabilities.filter((capability) => {
    if (runtimeOnly) {
      return capability.runtimeActive;
    }
    if (capability.runtimeActive) {
      return true;
    }
    if (options.includeServiceOnly && capability.status === "serviceOnly") {
      return true;
    }
    if (options.includeMetadataOnly && capability.status === "metadataOnly") {
      return true;
    }
    return Boolean(options.includeUnsupportedWithGlobalService && capability.serviceAvailable);
  });
  return cloneRegistryValue(filtered);
}

export function assertTemplateDoesNotClaimUnsupportedRuntime(templateId: string): true {
  const unsupportedRuntimePrimitiveIds = new Set<PrimitiveId>([
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
    "unitsDimensionalConsistency",
    "emergenceDetection",
    "robustnessResilience",
    "interventionStrategy"
  ]);
  for (const capability of templatePrimitiveCapabilities.filter((entry) => entry.templateId === templateId)) {
    const primitive = primitiveById.get(capability.primitiveId);
    if (!primitive) {
      throw new Error(`Unknown primitive ${capability.primitiveId}`);
    }
    if (capability.runtimeActive && primitive.status === "reserved") {
      throw new Error(`Template ${templateId} claims runtime support for reserved primitive ${capability.primitiveId}`);
    }
    if (capability.runtimeActive && unsupportedRuntimePrimitiveIds.has(capability.primitiveId)) {
      throw new Error(`Template ${templateId} claims unsupported runtime support for ${capability.primitiveId}`);
    }
  }
  return true;
}

export function getRoadmapNextPrimitivePhases(): readonly RoadmapPrimitivePhase[] {
  return cloneRegistryValue([
    { prompt: "20", label: "Hybrid Model Composition Layer V1", primitiveIds: ["hybridComposition"] },
    { prompt: "21-22", label: "Multi-Scale Systems + Views", primitiveIds: ["multiScale", "scaleAwareViews"] },
    { prompt: "23-24", label: "Boundaries + Spatial Fields", primitiveIds: ["boundariesEnvironment", "spatialFields"] },
    { prompt: "25", label: "Observability + Measurement", primitiveIds: ["observability"] },
    { prompt: "26", label: "Causal Assumptions + Influence Structure", primitiveIds: ["causalAssumptions"] },
    { prompt: "27", label: "Units, Dimensions + Quantity Semantics", primitiveIds: ["unitsDimensionalConsistency"] },
    { prompt: "28", label: "Emergence Detection + Pattern Descriptors", primitiveIds: ["emergenceDetection"] },
    { prompt: "29", label: "Robustness, Resilience + Stress Testing Semantics", primitiveIds: ["robustnessResilience"] },
    {
      prompt: "30",
      label: "Strategy, Control + Intervention Semantics",
      primitiveIds: ["interventionStrategy"]
    },
    { prompt: "31", label: "Model Schema/Interpreter Foundation", primitiveIds: ["modelDefinitionSchema", "safeInterpreterCompiler"] },
    { prompt: "32-37", label: "Adaptive Agents, Heterogeneity, Explainability + Error Budgets", primitiveIds: ["adaptiveAgents", "heterogeneity", "explainabilityTrace", "errorBudgets"] }
  ]);
}

function cloneRegistryValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
