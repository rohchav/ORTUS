import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createDefaultRunConfig,
  createDefaultScenario,
  productionTemplateMap,
  productionTemplates,
  templateAssumptionProfile,
  validateRunConfig,
  validateScenario
} from "../index";

const repoRoot = process.cwd();

const requiredDocPhrases = [
  "Service-first primitives are foundations, not active model behavior. A template should not claim support for a primitive until its runtime actually uses that primitive.",
  "Zooming the camera is not the same as multi-scale modeling. Multi-scale ORTUS models will require explicit scale levels, aggregation rules, disaggregation rules, cross-scale coupling, and warnings when detail is synthetic or lost.",
  "Model state is not the same as observable reality. Observability V1 distinguishes internal simulated state and runtime metrics from measured, partial, noisy, proxy, synthetic, or empirical observation definitions, but it does not execute measurement, calibration, validation, inference, or data assimilation.",
  "Relations, feedback loops, and events can encode model assumptions, but they do not by themselves prove causal relationships in the real world.",
  "Visual Builder Graph View V1 visualizes structural relationships; it does not execute nodes or edges.",
  "Graph selection, filtering, panning, and zooming are UI-only state.",
  "Graph View is not visual programming, schema execution, or runtime generation.",
  "A graph that looks complete is still not a runnable model.",
  "Repair suggestions are structural editing assistance. They do not make a schema runnable.",
  "A repaired schema may be structurally valid and still have no runtime implementation.",
  "ORTUS does not infer the correct model behavior from validation repairs.",
  "Validation repairs do not generate templates, scenarios, RunConfigs, snapshots, or engines.",
  "Rendered responsive behavior and WCAG-level accessibility remain unverified until browser and assistive-technology testing is available."
];

const futureTopLevelFields = [
  "multiScaleOptions",
  "scaleLevels",
  "aggregationRules",
  "disaggregationRules",
  "observabilityOptions",
  "measurementModel",
  "causalGraph",
  "causalAssumptions",
  "boundaryOptions",
  "fieldLayers",
  "spatialFields",
  "timeScaleOptions",
  "multiRateSchedule",
  "adaptiveAgentOptions",
  "heterogeneityOptions",
  "emergenceMetrics",
  "phaseTransitionOptions",
  "attractorOptions",
  "robustnessOptions",
  "traceOptions",
  "errorBudget",
  "unitSystem",
  "modelSchema",
  "compilerOptions",
  "visualBuilderState"
];

const inactivePrimitiveTopLevelFields = [
  "networkOptions",
  "resourceOptions",
  "resourceSystemDefinition",
  "eventScheduleOptions",
  "delayOptions",
  "feedbackLoopOptions"
];

describe("roadmap alignment and missing pillar reservations", () => {
  it("documents the revised roadmap and reserved missing pillars", () => {
    const roadmapPath = join(repoRoot, "docs", "roadmap.md");
    const missingPillarsPath = join(repoRoot, "docs", "missing-pillars.md");
    expect(existsSync(roadmapPath)).toBe(true);
    expect(existsSync(missingPillarsPath)).toBe(true);

    const roadmap = readFileSync(roadmapPath, "utf8");
    expect(roadmap).toContain("completed through Prompt 37B");
    expect(roadmap).toContain("Post-30B stabilization");
    expect(roadmap).toContain(
      "Prompt 31: Model Schema + Interpreter Foundation V1 through Prompt 37B: Schema Validation UX + Repair Suggestions Audit are complete."
    );
    expect(roadmap).toContain("Completed Prompt 31 audit band");
    expect(roadmap).toContain("Completed Prompt 32 planning and audit foundation");
    expect(roadmap).toContain("Completed Prompt 33 compatibility foundation");
    expect(roadmap).toContain("Completed Prompt 34 shell and audit foundation");
    expect(roadmap).toContain("Completed Prompt 35 authoring and audit foundation");
    expect(roadmap).toContain("Completed Prompt 36 graph-view foundation and audit");
    expect(roadmap).toContain("Completed Prompt 37 validation-assistance foundation and audit");
    expect(roadmap).toContain("Prompt 35 adds a separate `Author Schema` Builder mode");
    expect(roadmap).toContain("Non-roadmap Prompts N1, N1B, NUX1, NUX1B, N2, and N2B are complete.");
    expect(roadmap).toContain("The next roadmap prompt after the N2/N2B commit checkpoint is Prompt 38: Schema-to-Template Fit Report V1.");
    expect(roadmap).toContain("Prompt N2 adds Neural Strategy Adaptation V1 to the Neural Runtime Lab RPS/readout mode.");
    expect(roadmap).toContain("Non-roadmap Prompt N2B audits and hardens Neural Strategy Adaptation.");
    expect(roadmap).toContain("round-index reset guards");
    expect(roadmap).toContain("Strategy Adaptation V1 updates bounded game-state variables from observed RPS rounds.");
    expect(roadmap).toContain("The adaptive readout can exploit repeated patterns, but it cannot beat truly random optimal play over time.");
    expect(roadmap).toContain("31 - Model Schema + Interpreter Foundation V1");
    expect(roadmap).toContain("31B - Model Schema + Interpreter Foundation Audit");
    expect(roadmap).toContain("31C - Knowledge, Memory + Social Learning Semantics V1");
    expect(roadmap).toContain("31D - Knowledge, Memory + Social Learning Audit");
    expect(roadmap).toContain("32 - Visual Model Builder Planning + Workspace Schema V1");
    expect(roadmap).toContain("32B - Visual Builder Workspace Audit");
    expect(roadmap).toContain("33 - Template/Schema Compatibility Mapping V1");
    expect(roadmap).toContain("35 - Model Schema Authoring Forms V1");
    expect(roadmap).toContain("35B - Model Schema Authoring Forms Audit");
    expect(roadmap).toContain("36 - Visual Builder Graph View V1");
    expect(roadmap).toContain("36B - Visual Builder Graph View Audit");
    expect(roadmap).toContain("37 - Schema Validation UX + Repair Suggestions V1");
    expect(roadmap).toContain("37B - Schema Validation UX + Repair Suggestions Audit");
    expect(roadmap).toContain("38 - Schema-to-Template Fit Report V1");
    expect(roadmap).toContain("18B - Roadmap Alignment Audit");
    expect(roadmap).toContain("21 - Multi-Scale Systems Architecture V1");
    expect(roadmap).toContain("25 - Observability + Measurement Model V1");
    expect(roadmap).toContain("26 - Causal Assumptions + Influence Structure V1");
    expect(roadmap).toContain("27 - Units + Dimensional Consistency V1");
    expect(roadmap).toContain("Later: runnable visual model builder");
    expect(roadmap).toContain("Prompt 19 adds `src/simulation/registry` as the unified primitive registry and capability map");
    expect(roadmap.toLowerCase()).toContain("predictive claims are prohibited");

    const missingPillars = readFileSync(missingPillarsPath, "utf8");
    for (const heading of [
      "Multi-Scale Systems",
      "Scale-Aware Zoom/View",
      "Observability And Measurement",
      "Causal Assumptions",
      "Boundaries And Environment",
      "Spatial Fields And Environmental Layers",
      "Temporal Scale And Multi-Rate Time",
      "Adaptive Agents And Internal State",
      "Heterogeneity",
      "Emergence Detection",
      "Phase Transitions And Tipping Points",
      "Attractors And Basins",
      "Robustness And Resilience",
      "Control/Intervention Strategy",
      "Explainability And Trace Inspection",
      "Error Budgets And Approximation Warnings",
      "Units And Dimensional Consistency",
      "Model Versioning And Migration",
      "Pattern Libraries",
      "Domain Packs",
      "Human-In-The-Loop Model Critique"
    ]) {
      expect(missingPillars).toContain(heading);
    }
    expect(missingPillars).toContain("Must not claim yet");
  });

  it("keeps README, concepts, simulation docs, and AGENTS aligned on future-pillar boundaries", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "src", "simulation", "README.md"), "utf8"),
      readFileSync(join(repoRoot, "AGENTS.md"), "utf8")
    ].join("\n");

    for (const phrase of requiredDocPhrases) {
      expect(docs).toContain(phrase);
    }
    expect(docs).toContain("true multi-scale runtime");
    expect(docs).toContain("visual builder");
    expect(docs).toContain("observability");
    expect(docs).toContain("causal assumptions");
    expect(docs).toContain("Do not treat uncertainty ensembles as calibrated probabilities.");
    expect(docs).toContain("Validation status describes evidence about the model, not truth about the real world");
  });

  it("keeps production template assumptions honest about reserved future pillars", () => {
    const expectedText: Record<string, readonly string[]> = {
      "epidemic-spread": ["explicit contact networks", "healthcare", "delayed policy", "observability", "causal validation"],
      "opinion-dynamics": ["social or media network", "attention", "feedback cycles", "adaptive cognition", "causal validation"],
      "predator-prey": ["food/grass resources", "seasonal", "spatial fields", "observability", "causal validation"],
      "schelling-segregation": ["relational social networks", "institutional feedback", "delayed policy", "observability", "causal validation"],
      "flocking-boids": ["delayed perception", "animal cognition", "multi-scale", "observability"]
    };

    for (const [templateId, phrases] of Object.entries(expectedText)) {
      const template = productionTemplateMap[templateId as keyof typeof productionTemplateMap];
      const profile = templateAssumptionProfile(template);
      const text = [
        ...profile.assumptions,
        ...profile.limitations,
        ...profile.notRepresented,
        ...profile.appropriateUse,
        ...profile.inappropriateUse,
        ...profile.ethicsNotes
      ]
        .map((item) => `${item.label} ${item.description}`)
        .join(" ")
        .toLowerCase();
      for (const phrase of phrases) {
        expect(text).toContain(phrase.toLowerCase());
      }
      expect(profile.validationNotes).toMatch(/not calibrated|externally validated/i);
    }
  });

  it("rejects unsupported future-pillar and inactive primitive fields at RunConfig and Scenario top level", () => {
    for (const template of productionTemplates) {
      const runConfig = createDefaultRunConfig({ template, seed: `roadmap-${template.id}` });
      const scenario = createDefaultScenario({ template, now: "2026-01-01T00:00:00.000Z" });
      expect(validateRunConfig(runConfig, template).templateId).toBe(template.id);
      expect(validateScenario(scenario, template).scenario.templateId).toBe(template.id);

      for (const field of [...futureTopLevelFields, ...inactivePrimitiveTopLevelFields]) {
        expect(() => validateRunConfig({ ...runConfig, [field]: { reserved: true } } as never, template)).toThrow(/Unsupported RunConfig field/);
        expect(() => validateScenario({ ...scenario, [field]: { reserved: true } } as never, template)).toThrow(/Invalid scenario/);
      }
    }
  });
});
