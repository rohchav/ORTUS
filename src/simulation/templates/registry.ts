import type { SimulationTemplate } from "../kernel/types";
import { epidemicTemplate } from "./epidemic.template";
import { flockingTemplate } from "./flocking.template";
import { forestFireTemplate } from "./forestFire.template";
import { opinionTemplate } from "./opinion.template";
import { predatorPreyTemplate } from "./predatorPrey.template";
import { schellingTemplate } from "./schelling.template";

export const productionTemplateIds = [
  "epidemic-spread",
  "opinion-dynamics",
  "predator-prey",
  "schelling-segregation",
  "flocking-boids",
  "forest-fire"
] as const;

export type ProductionTemplateId = (typeof productionTemplateIds)[number];

export const productionTemplateMap: Record<ProductionTemplateId, SimulationTemplate> = {
  "epidemic-spread": epidemicTemplate,
  "opinion-dynamics": opinionTemplate,
  "predator-prey": predatorPreyTemplate,
  "schelling-segregation": schellingTemplate,
  "flocking-boids": flockingTemplate,
  "forest-fire": forestFireTemplate
};

export const productionTemplates: readonly SimulationTemplate[] = productionTemplateIds.map((id) => productionTemplateMap[id]);

export function getProductionTemplate(templateId: string): SimulationTemplate | undefined {
  return productionTemplates.find((template) => template.id === templateId);
}
