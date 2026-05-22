import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assumptionProfileArtifactType,
  buildAssumptionSummary,
  createDefaultRunConfig,
  createDefaultScenario,
  createEngineFromScenario,
  deserializeAssumptionProfileArtifact,
  deserializeAuthoredScenario,
  maxAssumptionProfileJsonLength,
  productionTemplateMap,
  productionTemplates,
  runConfigFromScenario,
  serializeAssumptionProfileArtifact,
  serializeAuthoredScenario,
  templateAssumptionProfile,
  uncertaintyConfigArtifactType,
  uncertaintyResultArtifactType,
  validateAssumptionProfile,
  validateScenario,
  type AssumptionItem,
  type ModelAssumptionProfile
} from "../index";
import { serializeUncertaintyConfig } from "../uncertainty";

const now = "2026-05-13T12:00:00.000Z";

function validProfile(): ModelAssumptionProfile {
  return {
    schemaVersion: "1",
    artifactType: assumptionProfileArtifactType,
    id: "assumption-profile:test",
    ownerType: "template",
    ownerId: "test-template",
    assumptions: [item("assumption-1", "Local interaction", "Agents interact only with nearby neighbors.")],
    limitations: [item("limitation-1", "Simplified", "The model omits many real-world processes.", "caution")],
    notRepresented: [item("not-represented-1", "Institutions", "Institutions are outside this template.", "caution")],
    appropriateUse: [item("use-1", "Exploration", "Use for qualitative model exploration.")],
    inappropriateUse: [item("misuse-1", "Prediction", "Do not use for prediction without validation.", "critical")],
    ethicsNotes: [item("ethics-1", "False precision", "Avoid presenting exploratory outputs as truth.", "caution")],
    validationStatus: "internallyTested",
    validationNotes: "Internally tested only; not calibrated or externally validated."
  };
}

function item(id: string, label: string, description: string, severity: AssumptionItem["severity"] = "info"): AssumptionItem {
  return { id, label, description, severity, confidence: "unknown" };
}

describe("assumptions, limits, and ethics metadata", () => {
  it("validates assumption profiles and rejects malformed or live-state-shaped payloads", () => {
    const profile = validProfile();
    expect(validateAssumptionProfile(profile)).toEqual(profile);
    expect(() => validateAssumptionProfile({ ...profile, id: "" })).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile({ ...profile, ownerId: "" })).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, id: "" }] })).toThrow(
      /Invalid assumption profile/
    );
    expect(() =>
      validateAssumptionProfile({
        ...profile,
        assumptions: [profile.assumptions[0]!, { ...profile.assumptions[0]! }]
      })
    ).toThrow(/Duplicate assumption item id/);
    expect(() => validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, label: "" }] })).toThrow(
      /Invalid assumption profile/
    );
    expect(() => validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, label: "x".repeat(160) }] })).toThrow(
      /Invalid assumption profile/
    );
    expect(() => validateAssumptionProfile({ ...profile, validationStatus: "externallyValidated" })).not.toThrow();
    expect(() => validateAssumptionProfile({ ...profile, validationStatus: "certified" })).toThrow(/Invalid assumption profile/);
    expect(() =>
      validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, severity: "urgent" }] })
    ).toThrow(/Invalid assumption profile/);
    expect(() =>
      validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, confidence: "certain" }] })
    ).toThrow(/Invalid assumption profile/);
    expect(() =>
      validateAssumptionProfile({ ...profile, limitations: [{ ...profile.limitations[0]!, description: "x".repeat(1000) }] })
    ).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile({ ...profile, ethicsNotes: { id: "not-array" } })).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile(new Date())).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile({ ...profile, snapshot: { tick: 1 } })).toThrow(/Invalid assumption profile/);
    expect(() => validateAssumptionProfile({ ...profile, assumptions: [{ ...profile.assumptions[0]!, source: "runSummary" }] })).not.toThrow();
    expect(() =>
      validateAssumptionProfile({
        ...profile,
        assumptions: [{ ...profile.assumptions[0]!, category: "audit" }],
        validationNotes: "x".repeat(maxAssumptionProfileJsonLength)
      })
    ).toThrow(/Invalid assumption profile|characters or less/);
    expect(() =>
      validateAssumptionProfile({
        ...profile,
        assumptions: [{ ...profile.assumptions[0]!, description: (() => "bad") as unknown as string }]
      })
    ).toThrow(/Invalid assumption profile/);
  });

  it("requires structured assumption profiles for every production template without unsupported validation claims", () => {
    for (const template of productionTemplates) {
      const profile = templateAssumptionProfile(template);
      expect(profile.artifactType).toBe(assumptionProfileArtifactType);
      expect(profile.ownerType).toBe("template");
      expect(profile.ownerId).toBe(template.id);
      expect(profile.assumptions.length).toBeGreaterThan(0);
      expect(profile.limitations.length).toBeGreaterThan(0);
      expect(profile.notRepresented.length).toBeGreaterThan(0);
      expect(profile.appropriateUse.length).toBeGreaterThan(0);
      expect(profile.inappropriateUse.length).toBeGreaterThan(0);
      expect(profile.validationStatus).not.toBe("calibrated");
      expect(profile.validationStatus).not.toBe("externallyValidated");
      expect(profile.validationStatus).not.toBe("patternValidated");
      expect(profile.validationNotes).toMatch(/not calibrated|externally validated/i);
      expect(JSON.stringify(profile)).not.toMatch(/certified|safe to use|validated prediction/i);
    }
    expect(templateAssumptionProfile(productionTemplateMap["epidemic-spread"]).ethicsNotes.map((note) => note.description).join(" ")).toMatch(
      /public-health|heterogeneity/i
    );
    expect(templateAssumptionProfile(productionTemplateMap["opinion-dynamics"]).ethicsNotes.map((note) => note.description).join(" ")).toMatch(
      /profile|manipulate|predict real groups/i
    );
    expect(templateAssumptionProfile(productionTemplateMap["schelling-segregation"]).ethicsNotes.map((note) => note.description).join(" ")).toMatch(
      /discriminatory|institutions|human agency/i
    );
    expect(templateAssumptionProfile(productionTemplateMap["predator-prey"]).inappropriateUse.map((note) => note.description).join(" ")).toMatch(
      /ecosystem|conservation/i
    );
    expect(templateAssumptionProfile(productionTemplateMap["flocking-boids"]).inappropriateUse.map((note) => note.description).join(" ")).toMatch(
      /animal|control systems|biological/i
    );
  });

  it("round-trips scenario assumption notes without overwriting template profiles or storing live state", () => {
    const template = productionTemplateMap["epidemic-spread"];
    const note = item("scenario-assumption-1", "Illustrative range", "Scenario range is illustrative, not calibrated.", "caution");
    const scenario = {
      ...createDefaultScenario({ template, scenarioId: "scenario-assumptions", now, seed: "assumption-seed" }),
      assumptionNotes: [note],
      limitationNotes: [item("scenario-limitation-1", "Small sample", "This scenario uses a small population.", "caution")],
      validationNotes: [item("scenario-validation-1", "Scenario validation", "Only schema and parameter validation have run.")],
      ethicsNotes: [item("scenario-ethics-1", "No decisions", "Do not use this scenario for public-health decision-making.", "critical")]
    };

    const validated = validateScenario(scenario).scenario;
    const imported = deserializeAuthoredScenario(serializeAuthoredScenario(validated));
    expect(imported.assumptionNotes?.[0]).toMatchObject(note);
    expect(JSON.stringify(imported)).not.toContain('"world"');
    expect(() => validateScenario({ ...scenario, assumptionNotes: [{ ...note, snapshot: { tick: 2 } }] })).toThrow(/Invalid scenario/);
    expect(() =>
      validateScenario({
        ...scenario,
        assumptionNotes: Array.from({ length: 25 }, (_, index) => item(`too-many-${index}`, "Too many", "Too many scenario notes."))
      })
    ).toThrow(/Invalid scenario/);
    expect(() =>
      validateScenario({
        ...scenario,
        ethicsNotes: [item("long-note", "Long note", "x".repeat(1000))]
      })
    ).toThrow(/Invalid scenario/);

    const summary = buildAssumptionSummary({ template, scenario: imported });
    expect(summary.templateProfile.ownerId).toBe(template.id);
    expect(summary.scenarioNotes.assumptionNotes?.[0]?.id).toBe("scenario-assumption-1");
    expect(summary.provenance.scenarioNoteCounts).toEqual({
      assumptionNotes: 1,
      limitationNotes: 1,
      validationNotes: 1,
      ethicsNotes: 1
    });

    const runConfig = runConfigFromScenario(imported);
    expect(runConfig.metadata?.assumptionProvenance).toMatchObject({
      templateId: template.id,
      templateVersion: template.version,
      templateProfileId: template.assumptionProfile?.id,
      templateValidationStatus: template.assumptionProfile?.validationStatus
    });
    expect(JSON.stringify(runConfig.metadata?.assumptionProvenance)).not.toContain("Recovered agents");
    const { engine } = createEngineFromScenario(imported);
    expect(engine.metadata.assumptionProvenance).toMatchObject({ scenarioId: "scenario-assumptions" });
  });

  it("surfaces uncertainty variable notes as assumption-summary cautions", () => {
    const template = productionTemplateMap["flocking-boids"];
    const base = createDefaultRunConfig({ template, seed: "uncertainty-assumption-seed" });
    const config = {
      schemaVersion: "1" as const,
      artifactType: "ortus.uncertaintyConfig" as const,
      id: "uncertainty-assumptions",
      label: "Assumption ranges",
      baseSeed: "sampler-seed",
      samplingMethod: "randomMonteCarlo" as const,
      sampleCount: 4,
      variables: [
        {
          id: "noise-range",
          label: "Noise strength",
          target: "parameter" as const,
          targetPath: "parameters.noise",
          distribution: { type: "uniform" as const, min: 0, max: 0.02 },
          enabled: true,
          notes: "Noise range is user-specified and not calibrated."
        }
      ],
      outputMetrics: ["averageSpeed"],
      metadata: { assumption: "Uncertainty ranges are illustrative assumptions unless calibrated." }
    };
    serializeUncertaintyConfig(config, base);
    const summary = buildAssumptionSummary({ template, uncertaintyConfig: config });
    expect(summary.uncertaintyNotes.map((note) => note.description).join(" ")).toMatch(/not calibrated|illustrative assumptions/);
    expect(summary.provenance.uncertaintyVariableNoteCount).toBe(1);
    expect(summary.provenance.uncertaintyAssumptionNoteCount).toBe(2);
    expect(() =>
      buildAssumptionSummary({
        template,
        uncertaintyConfig: {
          ...config,
          variables: [{ ...config.variables[0]!, notes: "x".repeat(1000) }]
        }
      })
    ).toThrow(/Invalid assumption items/);
  });

  it("combines template, scenario, and uncertainty notes predictably and falls back for missing profiles", () => {
    const template = productionTemplateMap["opinion-dynamics"];
    const fallback = templateAssumptionProfile({ ...template, assumptionProfile: undefined });
    expect(fallback.ownerId).toBe(template.id);
    expect(fallback.validationStatus).toBe("unknown");

    const scenario = {
      ...createDefaultScenario({ template, scenarioId: "scenario-summary", now }),
      assumptionNotes: [item("scenario-note", "Scenario note", "Scenario note remains additive.")]
    };
    const summary = buildAssumptionSummary({
      template,
      scenario,
      uncertaintyConfig: {
        id: "uncertainty-summary",
        label: "Uncertainty summary",
        variables: [
          {
            id: "strength",
            label: "Influence strength",
            target: "parameter",
            targetPath: "parameters.influenceStrength",
            distribution: { type: "fixed", value: 0.4 },
            enabled: true,
            notes: "This range is an assumption."
          }
        ]
      }
    });

    expect(summary.templateProfile.assumptions.length).toBeGreaterThan(0);
    expect(summary.scenarioNotes.assumptionNotes?.[0]?.id).toBe("scenario-note");
    expect(summary.uncertaintyNotes[0]?.id).toBe("uncertainty-strength");
    expect(summary.provenance).toMatchObject({
      templateId: template.id,
      templateVersion: template.version,
      scenarioId: "scenario-summary"
    });
  });

  it("exports assumption profiles as distinct artifacts and rejects scenario, snapshot, and uncertainty artifacts", () => {
    const profile = templateAssumptionProfile(productionTemplateMap["schelling-segregation"]);
    const json = serializeAssumptionProfileArtifact(profile);
    const imported = deserializeAssumptionProfileArtifact(json);
    expect(imported.artifactType).toBe("ortus.assumptionProfile");
    expect(imported.ownerId).toBe("schelling-segregation");

    const scenarioJson = serializeAuthoredScenario(
      createDefaultScenario({ template: productionTemplateMap["schelling-segregation"], scenarioId: "scenario-not-profile", now })
    );
    expect(() => deserializeAssumptionProfileArtifact(scenarioJson)).toThrow(/artifact type/);

    const snapshotJson = createEngineFromScenario(
      createDefaultScenario({ template: productionTemplateMap["epidemic-spread"], scenarioId: "scenario-snapshot-source", now })
    ).engine.exportSnapshot();
    expect(() => deserializeAssumptionProfileArtifact(snapshotJson)).toThrow(/artifact type/);

    const uncertaintyJson = JSON.stringify({ schemaVersion: "1", artifactType: uncertaintyConfigArtifactType });
    expect(() => deserializeAssumptionProfileArtifact(uncertaintyJson)).toThrow(/artifact type/);
    const uncertaintyResultJson = JSON.stringify({ schemaVersion: "1", artifactType: uncertaintyResultArtifactType });
    expect(() => deserializeAssumptionProfileArtifact(uncertaintyResultJson)).toThrow(/artifact type/);
    expect(() => deserializeAssumptionProfileArtifact(JSON.stringify({ ...profile, world: {} }))).toThrow(/Invalid assumption profile/);
    expect(() => deserializeAssumptionProfileArtifact(JSON.stringify({ ...profile, extra: "unknown" }))).toThrow(/Invalid assumption profile/);
    expect(() => deserializeAssumptionProfileArtifact("x".repeat(maxAssumptionProfileJsonLength + 1))).toThrow(/characters or less/);
  });

  it("registers and renders the assumptions panel without blocking the simulation workspace", () => {
    const panelRegistry = readFileSync(new URL("../../lib/workspacePanels.ts", import.meta.url), "utf8");
    const leftStack = readFileSync(new URL("../../components/LeftInstrumentStack.tsx", import.meta.url), "utf8");
    const panelSource = readFileSync(new URL("../../components/AssumptionsPanel.tsx", import.meta.url), "utf8");

    expect(panelRegistry).toContain('id: "assumptions"');
    expect(panelRegistry).toContain('"leftDrawer"');
    expect(panelRegistry).toContain('"workspace"');
    expect(leftStack).toContain("<AssumptionsPanel");
    expect(panelSource).toContain("Assumptions");
    expect(panelSource).toContain("Limitations");
    expect(panelSource).toContain("Not Represented");
    expect(panelSource).toContain("Appropriate Use");
    expect(panelSource).toContain("Inappropriate Use");
    expect(panelSource).toContain("Ethics Notes");
    expect(panelSource).toContain("Validation status describes evidence");
    expect(panelSource).not.toMatch(/alert\(|confirm\(/);
    expect(panelSource).not.toMatch(/safe|certified|prediction/i);
  });

  it("keeps assumption services headless and non-random", () => {
    const assumptionDir = new URL("../assumptions", import.meta.url);
    for (const file of readdirSync(assumptionDir)) {
      if (!file.endsWith(".ts")) {
        continue;
      }
      const source = readFileSync(join(assumptionDir.pathname, file), "utf8");
      expect(source).not.toMatch(/from "react"|from 'react'|zustand|document\.|window\.|Canvas|localStorage/);
      expect(source).not.toContain("Math.random");
      expect(source).not.toMatch(/eval\(|new Function/);
    }
  });
});
