import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getInterventionDefinitions, productionTemplateMap } from "../simulation";
import {
  deriveActiveInterventionReadiness,
  INTERVENTION_MODEL_BOUNDARY_COPY,
  INTERVENTION_READINESS_NON_PERSISTENT_COPY,
  INTERVENTION_RESPONSE_BOUNDARY_COPY
} from "./activeInterventionReadiness";

const repoRoot = process.cwd();
const epidemicTemplate = productionTemplateMap["epidemic-spread"];

describe("active intervention readiness", () => {
  it("derives available readiness from registered template intervention definitions", () => {
    const definitions = getInterventionDefinitions(epidemicTemplate.id);
    const readiness = deriveActiveInterventionReadiness({
      selectedTemplateId: epidemicTemplate.id,
      template: epidemicTemplate,
      definitions,
      selectedInterventionId: "epidemic.infectRadius",
      selectedEntityId: null,
      targetPoint: { x: 4.25, y: 8.5 },
      targetCell: null,
      hasActiveEngine: true,
      activeInterventionCount: 0
    });

    expect(readiness.readiness).toMatchObject({
      templateId: "epidemic-spread",
      templateLabel: "Epidemic Spread",
      worldModeLabel: "World / Intervene",
      availability: "available",
      registeredControlCount: definitions.length,
      registeredControlLabel: "2 registered template controls",
      selectedControlLabel: "Infect Radius",
      readinessCopy: INTERVENTION_READINESS_NON_PERSISTENT_COPY,
      modelBoundaryCopy: INTERVENTION_MODEL_BOUNDARY_COPY
    });
    expect(readiness.readiness.availabilityStatus).toMatchObject({
      label: "Controls available",
      category: "capability",
      state: "supported"
    });
    expect(readiness.targets.map((target) => target.id)).toEqual(definitions.map((definition) => definition.id));
    expect(readiness.targets.map((target) => target.label)).toEqual(definitions.map((definition) => definition.label));
    expect(readiness.selectedTarget).toMatchObject({
      id: "epidemic.infectRadius",
      targetKindLabel: "Radius around point or selected entity",
      targetStatusLabel: "Point 4.3, 8.5",
      targetReady: true,
      parameterSummaryLabel: "1 parameter",
      mutatesLabel: "agents"
    });
  });

  it("labels missing controls honestly without fabricating targets or future capabilities", () => {
    const readiness = deriveActiveInterventionReadiness({
      selectedTemplateId: "empty-template",
      templateLabel: "Empty Template",
      definitions: [],
      selectedEntityId: null,
      targetPoint: null,
      targetCell: null,
      hasActiveEngine: true,
      activeInterventionCount: 0
    });

    expect(readiness.readiness.availability).toBe("unavailable");
    expect(readiness.readiness.availabilityStatus).toMatchObject({
      label: "No controls",
      category: "capability",
      state: "unsupported"
    });
    expect(readiness.readiness.registeredControlLabel).toBe("No registered template controls");
    expect(readiness.targets).toEqual([]);
    expect(readiness.selectedTarget).toBeNull();
    expect(JSON.stringify(readiness)).not.toMatch(/future-only|Discovery Atlas record created|generated|fake/i);
  });

  it("keeps target readiness separate from template control availability", () => {
    const definitions = getInterventionDefinitions(epidemicTemplate.id);
    const missingTarget = deriveActiveInterventionReadiness({
      selectedTemplateId: epidemicTemplate.id,
      template: epidemicTemplate,
      definitions,
      selectedInterventionId: "epidemic.infectSelected",
      selectedEntityId: null,
      targetPoint: null,
      targetCell: null,
      hasActiveEngine: true,
      activeInterventionCount: 0
    });

    expect(missingTarget.readiness.availability).toBe("available");
    expect(missingTarget.selectedTarget).toMatchObject({
      label: "Infect Selected Agent",
      availability: "unavailable",
      targetKindLabel: "Selected entity",
      targetStatusLabel: "No entity selected",
      targetReady: false
    });
    expect(missingTarget.selectedTarget?.availabilityStatus).toMatchObject({
      label: "Target needed",
      category: "interaction",
      state: "idle"
    });

    const selectedTarget = deriveActiveInterventionReadiness({
      selectedTemplateId: epidemicTemplate.id,
      template: epidemicTemplate,
      definitions,
      selectedInterventionId: "epidemic.infectSelected",
      selectedEntityId: "agent-1",
      targetPoint: null,
      targetCell: null,
      hasActiveEngine: true,
      activeInterventionCount: 1
    });

    expect(selectedTarget.selectedTarget).toMatchObject({
      targetStatusLabel: "Selected entity agent-1",
      targetReady: true
    });
    expect(selectedTarget.readiness.activeRunRecordLabel).toBe(
      "1 active-run intervention record in current engine/snapshot state; not a saved Lab record."
    );
  });

  it("keeps intervention response boundaries unresolved and non-causal", () => {
    const readiness = deriveActiveInterventionReadiness({
      selectedTemplateId: epidemicTemplate.id,
      template: epidemicTemplate,
      definitions: getInterventionDefinitions(epidemicTemplate.id),
      selectedEntityId: null,
      targetPoint: null,
      targetCell: null,
      hasActiveEngine: true,
      activeInterventionCount: 0
    });

    expect(readiness.boundary.responseBoundaryCopy).toBe(INTERVENTION_RESPONSE_BOUNDARY_COPY);
    expect(readiness.boundary.evidenceStatus).toMatchObject({
      label: "Model response",
      category: "evidence",
      state: "unresolved"
    });
    expect(readiness.boundary.claimBoundaries.join(" ")).toContain("No Lab experiment record or Atlas discovery");
    expect(readiness.boundary.claimBoundaries.join(" ")).not.toMatch(/policy works|real-world causal proof|validated conclusion/i);
  });

  it("does not add storage, timestamps, random IDs, or fake tab stops in the GW3 slice", () => {
    const utilitySource = readFileSync(join(repoRoot, "src", "components", "activeInterventionReadiness.ts"), "utf8");
    const panelSource = readFileSync(join(repoRoot, "src", "components", "InterventionPanel.tsx"), "utf8");
    const forbiddenRuntimeApis = /localStorage|sessionStorage|IndexedDB|indexedDB|cookie|Date\.now|Math\.random|crypto\.randomUUID|randomUUID|uuid/i;

    expect(utilitySource).not.toMatch(forbiddenRuntimeApis);
    expect(panelSource).not.toMatch(forbiddenRuntimeApis);
    expect(panelSource).toContain('className="intervention-readiness" aria-labelledby="intervention-readiness-heading"');
    expect(panelSource).not.toMatch(/intervention-readiness[^>]+tabIndex=\{0\}/);
    expect(panelSource).not.toMatch(/intervention-readiness[^>]+role="button"/);
  });

  it("keeps Lab and Atlas GW3 copy future-only rather than creating records", () => {
    const labSource = readFileSync(join(repoRoot, "src", "app", "lab", "page.tsx"), "utf8");
    const atlasSource = readFileSync(join(repoRoot, "src", "app", "atlas", "page.tsx"), "utf8");

    expect(labSource).toContain("Persistent Lab intervention records are still not implemented.");
    expect(atlasSource).toContain("GW3 does not create Discovery Atlas records from intervention responses. Atlas remains future-only.");
    expect(labSource + atlasSource).not.toMatch(/send to Lab|map to Atlas|recent activity|evidence score|saved intervention/i);
  });
});
