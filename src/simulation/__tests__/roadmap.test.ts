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
  "Schema-to-template fit reports are structural fit analyses. They do not convert schemas into runnable models.",
  "A strong template fit does not mean a schema can run.",
  "Fit reports do not generate templates, scenarios, RunConfigs, snapshots, engines, or agents.",
  "Unsupported and lossy mappings must remain visible; they must not be silently dropped.",
  "Rule fits are structural comparisons. Rule declarations are not executed.",
  "Fit score is a structural summary, not a runtime readiness score.",
  "Validation asks whether the schema is structurally valid. Fit reporting asks which existing templates it structurally resembles.",
  "Builder graphs remain structural inspection views. Fit reports do not make them executable.",
  "Neural Strategy Adaptation is a local Neural Runtime Lab feature, not a generic schema-to-template capability.",
  "MR0 roadmap concepts may appear as future-only fit gaps. They are not implemented by this report.",
  "This fit report may be stale because the schema changed after it was generated. Refresh the report before using it.",
  "Scenario planning from schema is a planning aid. It does not create runnable scenarios.",
  "Scenario plans do not generate RunConfigs, snapshots, engines, agents, templates, or simulation state.",
  "Scenario questions are hypotheses to explore, not predictions or validated conclusions.",
  "A scenario plan can suggest what to inspect, but it does not prove what will happen.",
  "Assumption checks identify what the modeler should clarify. They do not resolve the assumption.",
  "Prompt 39B marks existing scenario plans stale when the schema or fit-report source changes, and copied stale reports must not present old output as current.",
  "Decision clusters model observable state-action patterns, not thoughts.",
  "Prediction outputs are probabilities, not certainties.",
  "Cluster labels are assigned modeling labels, not meanings understood by the system.",
  "External stimuli are modeled inputs, not evidence of internal mental state.",
  "Observed clusters are analytical groupings, not psychological profiles.",
  "Blackjack work is offline simulation only, not gambling advice, live casino assistance, or wearable card-counting support.",
  "Do not use wearable devices, camera input, or software assistance for live casino play.",
  "Rendered responsive behavior, clipboard behavior, focus return, zoom, screen-reader behavior, assistive-technology behavior, and WCAG conformance remain unverified.",
  "Measure multiscale structure before generating synthetic fractal structure.",
  "Fractal and multiscale tools describe how measured structure changes across scale. They do not prove that a system is fundamentally fractal.",
  "A complex-looking, nested, branching, or irregular pattern is not automatically fractal.",
  "Power-law behavior may indicate scale-free structure, but a power-law fit alone does not establish fractality.",
  "Finite-resolution fractal dimensions are estimators over a chosen scale range, not intrinsic truths about the modeled system.",
  "Statistical self-similarity must be supported across an explicit scale range; it should not be inferred from visual resemblance alone.",
  "Scale-free distributional evidence is not identical to geometric fractality.",
  "Visual resemblance to a fractal is not evidence of scale invariance.",
  "Fractal metrics are structural summaries of simulation output. They are not proof of biological, ecological, social, meteorological, or empirical validity.",
  "Fractal spatial generators create synthetic structure. They do not reproduce real geography, ecology, urban form, climate, terrain, or weather without calibration and validation.",
  "Coarse-graining changes what is represented. Similar aggregate behavior does not mean the underlying microstates are equivalent.",
  "Scale Lens views are analytical projections, not separate validated models.",
  "A scale-free degree distribution is not the same as a fractal network.",
  "A hierarchical community structure is not automatically self-similar.",
  "Network fractality requires a defined network-scale method and evidence across a supported scale range.",
  "Hierarchical trajectory motifs describe repeated observable state-action sequences. They do not reveal thoughts, intentions, beliefs, personality, or subconscious mental states.",
  "Repeated motifs across time windows are not automatically evidence of temporal fractality.",
  "Fractal analysis requires a defined object, scale operation, and measurement. ORTUS must not apply one generic fractal score to unrelated spatial, network, temporal, and trajectory data.",
  "Clustering groups similar observations. Fractal analysis measures how structure changes across scale. One does not imply the other.",
  "Synthetic fractal generators create model inputs, not observed reality.",
  "Coarse-graining may discard information and alter apparent dynamics.",
  "Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws."
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
    expect(roadmap).toContain("completed through Prompt 39B");
    expect(roadmap).toContain("Post-30B stabilization");
    expect(roadmap).toContain(
      "Prompt 31: Model Schema + Interpreter Foundation V1 through Prompt 39B: Scenario Planning From Schema Audit are complete."
    );
    expect(roadmap).toContain("Completed Prompt 31 audit band");
    expect(roadmap).toContain("Completed Prompt 32 planning and audit foundation");
    expect(roadmap).toContain("Completed Prompt 33 compatibility foundation");
    expect(roadmap).toContain("Completed Prompt 34 shell and audit foundation");
    expect(roadmap).toContain("Completed Prompt 35 authoring and audit foundation");
    expect(roadmap).toContain("Completed Prompt 36 graph-view foundation and audit");
    expect(roadmap).toContain("Completed Prompt 37 validation-assistance foundation and audit");
    expect(roadmap).toContain("Completed Prompt 38 fit-report foundation and audit");
    expect(roadmap).toContain("Completed Prompt 39 scenario-planning foundation");
    expect(roadmap).toContain("Completed Prompt 39 scenario-planning audit");
    expect(roadmap).toContain("Prompt 35 adds a separate `Author Schema` Builder mode");
    expect(roadmap).toContain("Non-roadmap Prompts N1, N1B, NUX1, NUX1B, N2, N2B, MR0, and F0 are complete.");
    expect(roadmap).toContain(
      "The next prompt is pending user direction; do not start F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any fractal/multiscale implementation without explicit approval."
    );
    expect(roadmap).toContain("Prompt N2 adds Neural Strategy Adaptation V1 to the Neural Runtime Lab RPS/readout mode.");
    expect(roadmap).toContain("Non-roadmap Prompt N2B audits and hardens Neural Strategy Adaptation.");
    expect(roadmap).toContain(
      "Non-roadmap Prompt MR0 records future template and decision-cluster direction only; it does not implement runtime behavior."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt F0 records future fractal and multiscale analysis direction only; it does not implement fractal metrics, fractal spatial generators, Scale Lens UI, network scaling analytics, trajectory motif analytics, template support, schema fields, primitives, or runtime behavior."
    );
    expect(roadmap).toContain("MR0 is documentation only.");
    expect(roadmap).toContain("T1: Urban Daily Routine / Activity Choice Template V1.");
    expect(roadmap).toContain("T2: Atmospheric Field Dynamics Template V1.");
    expect(roadmap).toContain("DC1: Cluster-Based Decision Readout Generalization V1.");
    expect(roadmap).toContain("DC2: Stimulus-Conditioned Decision Clusters V1.");
    expect(roadmap).toContain("G1: Blackjack Sequential Decision Lab V1.");
    expect(roadmap).toContain("DC3: Observed Cluster Discovery / Decision-Space Analytics V1.");
    expect(roadmap).toContain(
      "A stylized activity-choice ABM for agents, locations, routines, habits, resources, commute costs, time-of-day effects, and disruptions."
    );
    expect(roadmap).toContain(
      "A stylized spatial field model for temperature, moisture, pressure proxy, wind vector proxy, diffusion, advection-like movement, and threshold zones."
    );
    expect(roadmap).toContain(
      "context cluster → decision cluster → probability readout → selected action"
    );
    expect(roadmap).toContain(
      "external stimulus → context cluster activation → trajectory cluster → decision probabilities"
    );
    expect(roadmap).toContain(
      "Blackjack Sequential Decision Lab V1 is an offline simulated card-game decision lab, not gambling advice, casino assistance, or a real-money betting tool."
    );
    expect(roadmap).toContain(
      "Observed clusters are analytical groupings, not discovered thoughts, psychological types, or real-world identities."
    );
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
    expect(roadmap).toContain("38B - Schema-to-Template Fit Report Audit");
    expect(roadmap).toContain("39 - Scenario Planning From Schema V1");
    expect(roadmap).toContain("39B - Scenario Planning From Schema Audit");
    expect(roadmap).toContain("F0 - Fractal and Multiscale Analysis Mini-Roadmap");
    expect(roadmap).toContain("F1: Fractal Metrics V1.");
    expect(roadmap).toContain("F1B: Fractal Metrics Audit.");
    expect(roadmap).toContain("F2: Fractal Spatial Generators V1.");
    expect(roadmap).toContain("F2B: Fractal Spatial Generators Audit.");
    expect(roadmap).toContain("F3: Scale Lens / Coarse-Graining V1.");
    expect(roadmap).toContain("F3B: Scale Lens / Coarse-Graining Audit.");
    expect(roadmap).toContain("F4: Network Scaling Metrics V1.");
    expect(roadmap).toContain("F4B: Network Scaling Metrics Audit.");
    expect(roadmap).toContain("F5: Hierarchical Trajectory Motif Analytics V1.");
    expect(roadmap).toContain("F5B: Hierarchical Trajectory Motif Analytics Audit.");
    expect(roadmap).toContain(
      "Recommended F-branch implementation priority: F1 measurement -> F3 scale comparison -> F2 synthetic generation -> F4 network scaling -> F5 abstract trajectory analysis."
    );
    expect(roadmap).toContain("The numbering identifies the branch, but implementation sequencing may put F3 before F2");
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
    expect(docs).toContain("fractal metrics");
    expect(docs).toContain("fractal spatial generators");
    expect(docs).toContain("network scaling analytics");
    expect(docs).toContain("hierarchical trajectory motif analytics");
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
