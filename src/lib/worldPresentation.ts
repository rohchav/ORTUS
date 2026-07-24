import { getSystemCatalogEntry } from "./systemCatalog";
import { getTemplateDescriptor, type TemplateId } from "./templateVisuals";

export type WorldPresentationPriority = "primary" | "supporting" | "technical";

export interface ParameterPresentationDefinition {
  key: string;
  priority: Exclude<WorldPresentationPriority, "technical">;
  group: "Quick setup" | "Additional controls";
  rebuildsRun: true;
  order: number;
}

export interface MetricPresentationDefinition {
  key: string;
  priority: WorldPresentationPriority;
  order: number;
}

const primaryMetricKeys = {
  "epidemic-spread": ["infectedCount", "susceptibleCount", "recoveredCount"],
  "opinion-dynamics": ["polarizationScore", "averageOpinion", "opinionVariance"],
  "predator-prey": ["preyCount", "predatorCount"],
  "schelling-segregation": ["satisfactionRate", "dissatisfiedCount", "movedThisTick", "averageSimilarity"],
  "flocking-boids": ["alignmentScore", "dispersion", "averageNeighborCount", "averageSpeed"],
  "forest-fire": ["activeFireCount", "newIgnitions", "fuelFraction", "burnedFraction"],
  "neural-excitation-network": ["firingRate", "cascadeSize", "synchronyScore", "networkSaturation"]
} satisfies Record<TemplateId, readonly string[]>;

export function parameterPresentationForTemplate(templateId: TemplateId): ParameterPresentationDefinition[] {
  const template = getTemplateDescriptor(templateId).template;
  const quickKeys = getSystemCatalogEntry(templateId).quickParameterKeys;
  const quickOrder = new Map(quickKeys.map((key, index) => [key, index]));

  return template.parameterDefinitions
    .map((definition, sourceIndex) => {
      const primaryOrder = quickOrder.get(definition.key);
      return {
        key: definition.key,
        priority: primaryOrder === undefined ? "supporting" : "primary",
        group: primaryOrder === undefined ? "Additional controls" : "Quick setup",
        rebuildsRun: true,
        order: primaryOrder === undefined ? quickKeys.length + sourceIndex : primaryOrder
      } satisfies ParameterPresentationDefinition;
    })
    .sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
}

export function metricPresentationForTemplate(templateId: TemplateId, availableKeys: readonly string[]): MetricPresentationDefinition[] {
  const primaryOrder = new Map(primaryMetricKeys[templateId].map((key, index) => [key, index]));
  const supportingKeys = [...new Set(availableKeys)].filter((key) => !primaryOrder.has(key)).sort((left, right) => left.localeCompare(right));
  const supportingOrder = new Map(supportingKeys.map((key, index) => [key, index]));
  return [...new Set(availableKeys)]
    .map((key) => {
      const order = primaryOrder.get(key);
      const fallbackOrder = supportingOrder.get(key) ?? 0;
      return {
        key,
        priority: order === undefined ? (fallbackOrder < 8 ? "supporting" : "technical") : "primary",
        order: order === undefined ? primaryMetricKeys[templateId].length + fallbackOrder : order
      } satisfies MetricPresentationDefinition;
    })
    .sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
}

export function primaryMetricKeysForTemplate(templateId: TemplateId, availableKeys: readonly string[]): string[] {
  const prioritized = metricPresentationForTemplate(templateId, availableKeys).filter((metric) => metric.priority === "primary");
  if (prioritized.length > 0) {
    return prioritized.slice(0, 4).map((metric) => metric.key);
  }
  return metricPresentationForTemplate(templateId, availableKeys).slice(0, 4).map((metric) => metric.key);
}
