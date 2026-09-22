import { describe, expect, it } from "vitest";
import { productionTemplates } from "../../simulation/templates/registry";
import { initializationPresetsForTemplate } from "../../simulation/scenarios/scenarioPresets";
import { agentCompositionDefinitionsForTemplate, environmentOptionDefinitionsForTemplate } from "../../simulation/scenarios/scenarioVariantTypes";
import { requireStarterWorldById, starterWorlds } from "../starterWorlds/registry";
import type { StarterWorldDefinition } from "../starterWorlds/types";
import {
  deriveWorkbenchMaterialUsage, deriveWorkbenchModel, findWorkbenchPieceForControl,
  resolveWorkbenchControlDefinition, workbenchMaterials
} from "./index";
import type { WorkbenchControlGroup } from "./types";

describe("Visual Systems Workbench representation", () => {
  it("derives deterministic bounded decompositions with complete parent and relationship references for every Starter", () => {
    expect(new Set(starterWorlds.map((world) => world.runtime?.templateId)).size).toBe(productionTemplates.length);
    for (const world of starterWorlds) {
      const model = deriveWorkbenchModel(world);
      expect(deriveWorkbenchModel(world)).toEqual(model);
      const ids = new Set(model.pieces.map((piece) => piece.id));
      expect(ids.size).toBe(model.pieces.length);
      expect(model.pieces.length).toBeLessThanOrEqual(32);
      expect(model.relationships.length).toBeGreaterThan(2);
      expect(model.rootIds).toEqual(model.pieces.filter((piece) => !piece.parentId).map((piece) => piece.id));
      for (const piece of model.pieces) {
        const visited = new Set([piece.id]);
        let parentId = piece.parentId;
        while (parentId) {
          expect(ids.has(parentId)).toBe(true);
          expect(visited.has(parentId)).toBe(false);
          visited.add(parentId);
          parentId = model.pieces.find((candidate) => candidate.id === parentId)?.parentId;
        }
        expect(piece.capabilityReason.length).toBeGreaterThan(0);
        for (const materialId of piece.materialIds) expect(workbenchMaterials.some((material) => material.id === materialId)).toBe(true);
      }
      for (const relationship of model.relationships) {
        expect(ids.has(relationship.from)).toBe(true);
        expect(ids.has(relationship.to)).toBe(true);
        expect(relationship.from).not.toBe(relationship.to);
        expect(relationship.description.length).toBeGreaterThan(0);
      }
      for (const interaction of model.pieces.filter((piece) => piece.kind === "interaction")) {
        expect(model.relationships.some((relationship) => relationship.from === interaction.id || relationship.to === interaction.id),
          `${model.templateId}: ${interaction.label} needs an inspectable relationship`).toBe(true);
      }
    }
  });

  it("distinguishes the steering contributions and connects each contribution to motion state", () => {
    const model = deriveWorkbenchModel(requireStarterWorldById("flocking"));
    for (const id of ["alignment", "cohesion", "separation"]) {
      const piece = model.pieces.find((candidate) => candidate.id === id)!;
      expect(piece.motif).toBe(id);
      expect(piece.materialIds).toEqual(["local-neighborhood"]);
      expect(model.relationships.some((relationship) => relationship.from === id && relationship.to === "velocity")).toBe(true);
    }
    expect(model.relationships.some((relationship) => relationship.from === "velocity" && relationship.to === "movement")).toBe(true);
    expect(model.relationships.some((relationship) => relationship.from === "movement" && relationship.to === "position")).toBe(true);
    expect(model.relationships.some((relationship) => relationship.from === "position" && relationship.to === "neighborhood")).toBe(true);
    expect(model.pieces.find((piece) => piece.id === "neighborhood")?.motif).toBe("neighborhood");
  });

  it("preserves distinct systems rather than substituting a universal flock diagram", () => {
    const flocking = deriveWorkbenchModel(requireStarterWorldById("flocking"));
    const predator = deriveWorkbenchModel(requireStarterWorldById("predator-prey"));
    const epidemic = deriveWorkbenchModel(requireStarterWorldById("epidemic"));
    const forest = deriveWorkbenchModel(requireStarterWorldById("forest-spread"));
    expect(flocking.pieces.find((piece) => piece.id === "alignment")?.parentId).toBe("steering");
    expect(flocking.pieces.find((piece) => piece.id === "velocity")?.parentId).toBe("state");
    expect(predator.pieces.find((piece) => piece.id === "energy")?.parentId).toBe("predators");
    expect(predator.pieces.find((piece) => piece.id === "prey")?.description).toContain("do not carry an energy");
    expect(epidemic.pieces.find((piece) => piece.id === "infected")?.parentId).toBe("state");
    expect(epidemic.relationships.some((relation) => relation.from === "recovery" && relation.to === "recovered")).toBe(true);
    expect(forest.pieces.find((piece) => piece.id === "neighborhood")?.parentId).toBe("grid");
    expect(forest.pieces.find((piece) => piece.id === "fuel")?.description).toContain("categorical");
    expect(forest.pieces.flatMap((piece) => piece.materialIds)).not.toContain("consumption");
    expect(forest.pieces.flatMap((piece) => piece.materialIds)).not.toContain("resources");
    expect(new Set([flocking, predator, epidemic, forest].map((model) => model.pieces.map((piece) => piece.id).join(","))).size).toBe(4);
  });

  it("places every authoritative control once and resolves definitions directly without copied parameter authority", () => {
    for (const template of productionTemplates) {
      const world = starterWorlds.find((candidate) => candidate.runtime?.templateId === template.id)!;
      const model = deriveWorkbenchModel(world);
      const references = model.pieces.flatMap((piece) => piece.controls);
      expect(new Set(references.map((reference) => `${reference.group}:${reference.key}`)).size).toBe(references.length);
      // All current parameters have a deliberate piece owner, so a renamed or
      // added definition cannot silently collect under generic dynamics.
      expect(model.pieces.find((piece) => piece.id === "dynamics")?.controls.filter((reference) => reference.group === "parameters")).toEqual([]);
      const groups = [
        ["parameters", template.parameterDefinitions],
        ["agentComposition", agentCompositionDefinitionsForTemplate(template)],
        ["environmentOptions", environmentOptionDefinitionsForTemplate(template)]
      ] as const;
      for (const [group, definitions] of groups) {
        expect(references.filter((reference) => reference.group === group).map((reference) => reference.key).sort())
          .toEqual(definitions.map((definition) => definition.key).sort());
        for (const definition of definitions) {
          const reference = { group, key: definition.key };
          expect(findWorkbenchPieceForControl(model, group, definition.key)).toBeDefined();
          expect(resolveWorkbenchControlDefinition(reference, template, { initializationPreset: world.runtime!.defaultScenarioId })).toBe(definition);
        }
      }
      for (const preset of initializationPresetsForTemplate(template)) {
        for (const definition of preset.optionDefinitions ?? []) {
          const reference = { group: "initializationOptions" as const, key: definition.key };
          expect(findWorkbenchPieceForControl(model, reference.group, reference.key)).toBeDefined();
          expect(resolveWorkbenchControlDefinition(reference, template, { initializationPreset: preset.id })).toBe(definition);
        }
      }
      expect(references.filter((reference) => reference.group === "initializationOptions").map((reference) => reference.key).sort())
        .toEqual([...new Set(initializationPresetsForTemplate(template).flatMap((preset) => (preset.optionDefinitions ?? []).map((definition) => definition.key)))].sort());
      for (const reference of references) expect(Object.keys(reference).sort()).toEqual(["group", "key"]);
      for (const key of ["seed", "initializationPreset", "behaviorMode"]) {
        expect(findWorkbenchPieceForControl(model, "run", key)).toBeDefined();
        expect(resolveWorkbenchControlDefinition({ group: "run", key }, template, { initializationPreset: "missing" })).toBeUndefined();
      }
      expect(findWorkbenchPieceForControl(model, "parameters", "missing-control")).toBeUndefined();
    }
  });

  it("resolves options for the current recipe, including actual Epidemic initialized counts", () => {
    const template = productionTemplates.find((candidate) => candidate.id === "epidemic-spread")!;
    const model = deriveWorkbenchModel(requireStarterWorldById("epidemic"));
    expect(findWorkbenchPieceForControl(model, "initializationOptions", "initialInfectedCount")?.id).toBe("infected");
    expect(findWorkbenchPieceForControl(model, "parameters", "initialInfected")?.description).toContain("overridden");
    const hotspot = { group: "initializationOptions" as const, key: "hotspotCount" };
    expect(resolveWorkbenchControlDefinition(hotspot, template, { initializationPreset: "random-outbreak" })).toBeUndefined();
    expect(resolveWorkbenchControlDefinition(hotspot, template, { initializationPreset: "multiple-hotspots" })?.key).toBe("hotspotCount");
    expect(resolveWorkbenchControlDefinition(hotspot, template, { initializationPreset: "unknown-preset" })).toBeUndefined();
  });

  it("does not promote global structural services, proximity, scalar energy, or grid fuel to generic runtime support", () => {
    for (const world of starterWorlds) {
      const model = deriveWorkbenchModel(world);
      const materials = deriveWorkbenchMaterialUsage(model);
      const material = (id: string) => materials.find((entry) => entry.id === id)!;
      expect(material("spatial-fields").capability).toBe("structural");
      expect(material("resources").capability).toBe("structural");
      expect(material("feedback").capability).toBe("structural");
      expect(material("composition").capability).toBe("structural");
      expect(material("network").capability).toBe(model.templateId === "neural-excitation-network" ? "executable" : "structural");
      for (const usage of materials.filter((entry) => entry.capability === "executable")) {
        expect(usage.pieceIds.length).toBeGreaterThan(0);
        expect(usage.pieceIds.every((id) => model.pieces.some((piece) => piece.id === id && piece.materialIds.includes(usage.id)))).toBe(true);
      }
    }
    const opinionMaterials = deriveWorkbenchMaterialUsage(deriveWorkbenchModel(requireStarterWorldById("opinion-dynamics")));
    expect(opinionMaterials.find((material) => material.id === "movement")?.capability).toBe("reference");
  });

  it("cannot activate executable capabilities by attaching a material to an explanatory piece", () => {
    const model = deriveWorkbenchModel(requireStarterWorldById("flocking"));
    model.pieces[0]!.materialIds.push("network", "spatial-fields", "resources", "composition");
    for (const usage of deriveWorkbenchMaterialUsage(model).filter((material) => ["network", "spatial-fields", "resources", "composition"].includes(material.id))) {
      expect(usage.capability).toBe("structural");
    }
  });

  it("does not mutate frozen Starter sources, template definitions, or previous representations", () => {
    const world = requireStarterWorldById("flocking");
    const before = JSON.stringify(world);
    const definitionsBefore = JSON.stringify(productionTemplates.map((template) => template.parameterDefinitions));
    const first = deriveWorkbenchModel(world);
    const expected = deriveWorkbenchModel(world);
    first.pieces[0]!.label = "Changed presentation";
    first.pieces[0]!.controls.push({ group: "parameters" as WorkbenchControlGroup, key: "arbitrary" });
    first.relationships.pop();
    expect(deriveWorkbenchModel(world)).toEqual(expected);
    expect(JSON.stringify(world)).toBe(before);
    expect(JSON.stringify(productionTemplates.map((template) => template.parameterDefinitions))).toBe(definitionsBefore);
    expect(Object.isFrozen(workbenchMaterials)).toBe(true);
  });

  it("keeps a reference Starter without a runtime non-executable", () => {
    const source = requireStarterWorldById("flocking");
    const { runtime: _runtime, ...reference } = source;
    const world: StarterWorldDefinition = { ...reference, runtimeStatus: "concept-only" };
    const model = deriveWorkbenchModel(world);
    expect(model.pieces.every((piece) => piece.capability === "reference" && piece.controls.length === 0)).toBe(true);
    expect(model.relationships).toEqual([]);
    expect(deriveWorkbenchMaterialUsage(model).every((material) => material.capability !== "executable")).toBe(true);
  });
});
