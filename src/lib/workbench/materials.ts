import { getPrimitive, getTemplateCapability } from "../../simulation/registry";
import type { WorkbenchMaterial, WorkbenchMaterialUsage, WorkbenchModel } from "./types";

/** A shared explanatory vocabulary, not a library of executable primitives. */
export const workbenchMaterials: readonly WorkbenchMaterial[] = Object.freeze([
  { id: "agents", label: "Agents & populations", description: "Distinct model entities with template-owned roles and bounded state.", motif: "agents" },
  { id: "state", label: "State", description: "Values or categories carried by model entities; the Workbench describes their shape, never their live values.", motif: "state" },
  { id: "local-neighborhood", label: "Local neighborhood", description: "Nearby agents or adjacent cells available to a template's local rule.", motif: "neighborhood" },
  { id: "movement", label: "Movement", description: "Template-owned changes to positions or occupied cells.", motif: "movement" },
  { id: "consumption", label: "Consumption", description: "A template-owned encounter that removes prey and changes predator energy; no generic stock-flow execution.", motif: "consumption" },
  { id: "birth-death", label: "Birth & death", description: "Template-owned entity creation and removal rules.", motif: "lifecycle" },
  { id: "transmission", label: "Transmission", description: "A local contact or adjacency rule that changes another entity's state.", motif: "transmission" },
  { id: "grid", label: "Grid", description: "Discrete cells and explicit local adjacency, distinct from a continuous spatial field.", motif: "grid" },
  { id: "network", label: "Network", description: "Explicit nodes and directed relations. Runtime support is scoped to the declared template.", motif: "network", primitiveId: "networks" },
  { id: "stochasticity", label: "Seeded variation", description: "Template-owned seeded initialization or random trials; probabilities are model settings, not calibrated estimates.", motif: "variation" },
  { id: "spatial-fields", label: "Spatial fields", description: "Declared spatial quantities; existing field services do not execute sampling, diffusion, or advection here.", motif: "field", primitiveId: "spatialFields" },
  { id: "resources", label: "Stocks & flows", description: "Headless quantity declarations, distinct from categorical fuel or a template's scalar energy component.", motif: "stock", primitiveId: "resources" },
  { id: "feedback", label: "Feedback & delays", description: "Structural loop and timing artifacts. A template's fixed delayed transition does not execute these artifacts.", motif: "feedback", primitiveId: "feedbackEvents" },
  { id: "composition", label: "System composition", description: "Structural composition contracts; arbitrary combinations cannot generate or activate a runtime.", motif: "composition", primitiveId: "hybridComposition" }
].map((material) => Object.freeze(material)) as WorkbenchMaterial[]);

export function deriveWorkbenchMaterialUsage(model: WorkbenchModel): WorkbenchMaterialUsage[] {
  return workbenchMaterials.map((material) => {
    const pieces = model.pieces.filter((piece) => piece.materialIds.includes(material.id));
    const primitive = material.primitiveId ? getPrimitive(material.primitiveId) : undefined;
    const templateCapability = material.primitiveId ? getTemplateCapability(model.templateId, material.primitiveId) : undefined;
    const executablePieces = pieces.filter((piece) => piece.capability === "executable");
    // A pictured use cannot upgrade the registry's runtime contract.
    if (executablePieces.length > 0 && (!material.primitiveId || templateCapability?.runtimeActive)) {
      return {
        ...material,
        capability: "executable",
        capabilityReason: templateCapability?.notes ?? "Used by this template's existing rules. This material cannot be wired into another runtime.",
        pieceIds: executablePieces.map((piece) => piece.id)
      };
    }
    if (primitive?.status === "serviceOnly" || templateCapability?.serviceAvailable || pieces.some((piece) => piece.capability === "structural")) {
      return {
        ...material,
        capability: "structural",
        capabilityReason: templateCapability?.notes ?? "Structural declarations are available; this model does not execute them.",
        pieceIds: pieces.map((piece) => piece.id)
      };
    }
    if (primitive?.status === "reserved") {
      return { ...material, capability: "future", capabilityReason: primitive.currentScope, pieceIds: [] };
    }
    return {
      ...material,
      capability: "reference",
      capabilityReason: "Shared systems vocabulary; absent from this model's runtime pieces. It cannot be added as an executable operation here.",
      pieceIds: pieces.map((piece) => piece.id)
    };
  });
}
