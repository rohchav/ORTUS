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
  "Fractal and multiscale metrics are structural summaries, not causal explanations, forecasts, validation results, or proof of universal laws.",
  "ORTUS is a sandbox for exploring how interacting mechanisms, constraints, feedback, stochasticity, adaptation, selection, and history can produce complex, path-dependent, and sometimes chaotic system-level behavior.",
  "The world is neither perfectly ordered nor merely random. Complex patterns emerge from constrained interactions, feedback, adaptation, stochasticity, and history.",
  "ORTUS helps users explore those mechanisms while remaining honest about uncertainty, scale, evidence, and the limits of models.",
  "ORTUS should expand the user’s range of plausible explanations without implying that complexity makes explanation, evidence, responsibility, or intervention impossible.",
  "ORTUS is designed to help users investigate how system-level patterns can emerge from local interactions and constraints.",
  "ORTUS models are representations for exploration and comparison, not direct copies of reality.",
  "Complexity does not mean the absence of rules. It means that interacting rules, constraints, feedback, and history can produce outcomes that cannot be understood from one mechanism in isolation.",
  "ORTUS should challenge context-free certainty, not the existence of evidence, mechanisms, or constraints.",
  "Outcomes can be historically contingent without being causeless or arbitrary.",
  "Chance operates within structural, environmental, and historical constraints.",
  "Adaptation is local and conditional. It does not guarantee global improvement, fairness, efficiency, stability, or progress.",
  "Evolutionary processes have no required destination and may produce both resilience and fragility.",
  "Be tolerant of uncertainty, heterogeneity, and competing plausible mechanisms while remaining strict about evidence, harm, and unsupported claims.",
  "ORTUS should reward better questions, stronger comparisons, and more honest interpretation—not confidence, certainty, or favorable outcomes.",
  "Matching an observed pattern does not establish that the modeled mechanism caused it.",
  "Changing scale can reveal structure while hiding variation and mechanism.",
  "A model can show what follows from its assumptions. It cannot establish that those assumptions fully describe reality.",
  "Simulation output is evidence about the model’s behavior, not automatically evidence about the world.",
  "ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist.",
  "The user progresses by gaining reusable understanding and modeling capability, not by accumulating arbitrary points.",
  "ORTUS progression is both technical and intellectual: users acquire tools while learning why simple explanations often fail.",
  "The advanced ORTUS challenge is to construct, interrogate, and explain a complex model without losing scientific discipline.",
  "Complexity should increase analytical humility, not eliminate accountability.",
  "Prefer features that deepen exploration, comparison, explanation, and reuse. Reject features that primarily reward compulsion, certainty, spectacle, or unsupported real-world authority.",
  "ORTUS should move from a collection of sophisticated modeling screens toward a persistent research environment where worlds, experiments, evidence, questions, and reusable capabilities accumulate.",
  "Progression must organize learning and discovery without implying that the user has mastered reality, proven a mechanism, or completed a scientific domain.",
  "GW0 defines destination responsibilities. It does not implement destination navigation or persistence.",
  "progress = reusable understanding + modeling capability + investigative depth",
  "progress = clicks + time + completed tasks",
  "Research World progression is a flexible expansion of investigative capability, not a universal curriculum or player-level system.",
  "Contextual capability guidance is not the same as hard-locking tools.",
  "A Discovery Atlas records investigated model behavior.",
  "It does not certify discoveries about the real world.",
  "A behavioral landscape maps what has been investigated.",
  "It must not imply that unsampled regions are known.",
  "Persistence must preserve provenance and model boundaries.",
  "Reusable does not mean universally compatible.",
  "Finding that the model cannot support a conclusion is meaningful progress.",
  "A new modeling frontier expands the questions ORTUS can represent. It does not guarantee better answers.",
  "Grand Systems Challenges should test model construction, interrogation, comparison, and scientific discipline—not optimization toward a scripted victory state.",
  "Beginners should receive a clear investigative starting point. Experts should not be forced through a simulated beginner journey.",
  "Progressive guidance and expert access must coexist.",
  "Research continuity should be supported without manufacturing urgency.",
  "Contextual guidance may respond to the state of the model and workspace. It must not become psychological profiling of the user.",
  "The Research World architecture must wrap and reorganize validated workflows before attempting to replace them.",
  "GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.",
  "UX2 establishes shared visual semantics. It does not perform the Research World shell transformation.",
  "UX2 prepares the visual language. GW1 performs the structural shell transformation.",
  "Operational success means the requested software operation completed. It does not mean the modeled conclusion was scientifically validated.",
  "Domain color identifies modeled content. Semantic color communicates interface and evidence state."
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
  "visualBuilderState",
  "researchWorldState",
  "progressionState",
  "discoveryAtlas",
  "missionState",
  "achievementState",
  "unlockState",
  "livingSystemsAtlasState",
  "worldLabAtlasWorkshopState",
  "discoveryState",
  "behavioralLandscapeState"
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
    const productPhilosophyPath = join(repoRoot, "docs", "PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md");
    const researchWorldRoadmapPath = join(repoRoot, "docs", "RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md");
    const livingSystemsAtlasPath = join(repoRoot, "docs", "ui", "LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md");
    const existingDesignAuditPath = join(repoRoot, "docs", "ui", "EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md");
    const semanticTokenFoundationPath = join(repoRoot, "docs", "ui", "LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md");
    expect(existsSync(roadmapPath)).toBe(true);
    expect(existsSync(missingPillarsPath)).toBe(true);
    expect(existsSync(productPhilosophyPath)).toBe(true);
    expect(existsSync(researchWorldRoadmapPath)).toBe(true);
    expect(existsSync(livingSystemsAtlasPath)).toBe(true);
    expect(existsSync(existingDesignAuditPath)).toBe(true);
    expect(existsSync(semanticTokenFoundationPath)).toBe(true);

    const roadmap = readFileSync(roadmapPath, "utf8");
    const productPhilosophy = readFileSync(productPhilosophyPath, "utf8");
    const researchWorldRoadmap = readFileSync(researchWorldRoadmapPath, "utf8");
    const livingSystemsAtlas = readFileSync(livingSystemsAtlasPath, "utf8");
    const existingDesignAudit = readFileSync(existingDesignAuditPath, "utf8");
    const semanticTokenFoundation = readFileSync(semanticTokenFoundationPath, "utf8");
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
    expect(roadmap).toContain("Non-roadmap Prompts N1, N1B, NUX1, NUX1B, N2, N2B, MR0, F0, P0, UX0, UX1, GW0, UX2, UX2B, GW1, GW1B, GW2, GW2B, GW3, GW3B, GW4, GW4B, and GW5 are complete.");
    expect(roadmap).toContain(
      "GW5B is the next Research World audit prompt only with explicit approval; do not start GW5B-GW6 Research World implementation, F1, Scale Lens, fractal metrics, fractal generators, network scaling analytics, trajectory motif analytics, or any further Research World/fractal/multiscale implementation without explicit approval."
    );
    expect(roadmap).toContain("Prompt GW1 implements the shared Research World destination shell.");
    expect(roadmap).toContain("Prompt GW1B audits and hardens the destination shell without expanding product behavior.");
    expect(roadmap).toContain("Prompt GW2 adds Active Run Provenance and Observation in World Observe only.");
    expect(roadmap).toContain("Prompt UX2B adds a rendered browser audit harness with Playwright and Axe, and executes it.");
    expect(roadmap).toContain("The full suite passed for `/` and `/builder`, including route load, viewport, reduced-motion, keyboard/focus smoke, shared primitive, status-semantic, Builder badge, and Axe checks.");
    expect(roadmap).toContain("Prompt N2 adds Neural Strategy Adaptation V1 to the Neural Runtime Lab RPS/readout mode.");
    expect(roadmap).toContain("Non-roadmap Prompt N2B audits and hardens Neural Strategy Adaptation.");
    expect(roadmap).toContain(
      "Non-roadmap Prompt MR0 records future template and decision-cluster direction only; it does not implement runtime behavior."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt F0 records future fractal and multiscale analysis direction only; it does not implement fractal metrics, fractal spatial generators, Scale Lens UI, network scaling analytics, trajectory motif analytics, template support, schema fields, primitives, or runtime behavior."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt P0 records ORTUS product philosophy, learning mission, epistemic guardrails, and future Research World progression direction only; it does not implement progression, missions, XP, streaks, unlocks, scoring, persistence, social features, runtime behavior, templates, or UI flows."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt UX0 records the ORTUS Living Systems Atlas visual and interaction target only; it does not implement World/Lab/Atlas/Workshop routes, tabs, navigation, shell redesign, CSS tokens, component changes, persistence, discovery logic, behavioral landscapes, progression, runtime behavior, dependencies, remote fonts, icons, animations, or mockups."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt UX1 records the existing design-token and component audit only; it inventories real UI/CSS/component sources, migration risk, accessibility and responsive source risks, and retain/adapt/replace/retire classifications."
    );
    expect(roadmap).toContain(
      "Docs-only Prompt GW0 records ORTUS Research World progression architecture only; it defines model-bounded investigation context"
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
    expect(roadmap).toContain("P0: ORTUS Product Philosophy and Learning Mission.");
    expect(roadmap).toContain("UX0: Living Systems Atlas Visual Direction.");
    expect(roadmap).toContain("UX1: Existing Design Token and Component Audit.");
    expect(roadmap).toContain("GW0: Research World Progression Mini-Roadmap.");
    expect(roadmap).toContain("UX2: Shared Design Foundations.");
    expect(roadmap).toContain("UX2B - Living Systems Atlas Semantic Foundation Rendered Browser Audit Harness.");
    expect(roadmap).toContain("GW1: Persistent Destination Shell.");
    expect(roadmap).toContain("GW1B: Persistent Destination Shell Audit.");
    expect(roadmap).toContain("GW2: Active Run Provenance And Observation Layer.");
    expect(roadmap).toContain("GW2B: Active Run Provenance And Observation Layer Audit.");
    expect(roadmap).toContain("GW3: Active Intervention Boundary And Perturbation Readiness.");
    expect(roadmap).toContain("GW3B: Active Intervention Boundary Audit And Hardening.");
    expect(roadmap).toContain("GW4: Discovery Atlas.");
    expect(roadmap).toContain("GW4B: Discovery Atlas Audit.");
    expect(roadmap).toContain("GW5: Lab Evidence Record Information Architecture.");
    expect(roadmap).toContain("GW5B: Lab Evidence Record Information Architecture Audit.");
    expect(roadmap).toContain("GW6: Contextual Capability Guidance.");
    expect(roadmap).toContain("GW6B: Contextual Capability Guidance Audit.");
    expect(roadmap).toContain(
      "Composition frontiers and Grand Systems Challenges remain future product directions beyond this near-term branch unless a dedicated roadmap prompt scopes them with explicit audit gates."
    );
    expect(roadmap).toContain(
      "P0, UX0, UX1, and GW0 are complete as documentation-only prompts, UX2/UX2B are complete as bounded shared visual-foundation and rendered-audit prompts, GW1/GW1B are complete as the first bounded destination-shell implementation and audit pair, GW2/GW2B are complete as live World active-run context and audit, and GW3 is complete as live World intervention readiness only."
    );
    expect(roadmap).toContain("UX2 - Living Systems Atlas Semantic Token Foundation.");
    expect(roadmap).toContain("Prompt UX0 is a docs-only visual direction and UX-principle branch");
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
    for (const phrase of [
      "ORTUS is a sandbox for exploring how interacting mechanisms, constraints, feedback, stochasticity, adaptation, selection, and history can produce complex, path-dependent, and sometimes chaotic system-level behavior.",
      "The world is neither perfectly ordered nor merely random. Complex patterns emerge from constrained interactions, feedback, adaptation, stochasticity, and history.",
      "ORTUS helps users explore those mechanisms while remaining honest about uncertainty, scale, evidence, and the limits of models.",
      "ORTUS should expand the user’s range of plausible explanations without implying that complexity makes explanation, evidence, responsibility, or intervention impossible.",
      "ORTUS is designed to help users investigate how system-level patterns can emerge from local interactions and constraints.",
      "ORTUS models are representations for exploration and comparison, not direct copies of reality.",
      "Complexity does not mean the absence of rules. It means that interacting rules, constraints, feedback, and history can produce outcomes that cannot be understood from one mechanism in isolation.",
      "ORTUS should challenge context-free certainty, not the existence of evidence, mechanisms, or constraints.",
      "Outcomes can be historically contingent without being causeless or arbitrary.",
      "Chance operates within structural, environmental, and historical constraints.",
      "Adaptation is local and conditional. It does not guarantee global improvement, fairness, efficiency, stability, or progress.",
      "Evolutionary processes have no required destination and may produce both resilience and fragility.",
      "Be tolerant of uncertainty, heterogeneity, and competing plausible mechanisms while remaining strict about evidence, harm, and unsupported claims.",
      "ORTUS should reward better questions, stronger comparisons, and more honest interpretation—not confidence, certainty, or favorable outcomes.",
      "Matching an observed pattern does not establish that the modeled mechanism caused it.",
      "Changing scale can reveal structure while hiding variation and mechanism.",
      "A model can show what follows from its assumptions. It cannot establish that those assumptions fully describe reality.",
      "Simulation output is evidence about the model’s behavior, not automatically evidence about the world.",
      "ORTUS progression should emerge from building a capable laboratory, discovering system behavior, and reaching new modeling frontiers—not from completing a prescribed checklist.",
      "The user progresses by gaining reusable understanding and modeling capability, not by accumulating arbitrary points.",
      "ORTUS progression is both technical and intellectual: users acquire tools while learning why simple explanations often fail.",
      "The advanced ORTUS challenge is to construct, interrogate, and explain a complex model without losing scientific discipline.",
      "Complexity should increase analytical humility, not eliminate accountability.",
      "Prefer features that deepen exploration, comparison, explanation, and reuse. Reject features that primarily reward compulsion, certainty, spectacle, or unsupported real-world authority."
    ]) {
      expect(productPhilosophy).toContain(phrase);
    }
    for (const phrase of [
      "constraints + mechanisms + initial conditions + stochastic events + history → observed trajectory",
      "epistemic tolerance",
      "What is happening here?",
      "How do I configure every field?",
      "One run varies unexpectedly → introduce seeds and uncertainty.",
      "Matching an observed pattern does not establish that the modeled mechanism caused it.",
      "Changing scale can reveal structure while hiding variation and mechanism."
    ]) {
      expect(productPhilosophy).toContain(phrase);
    }
    for (const phrase of [
      "GW0 is documentation, product architecture, information architecture, and roadmap planning only.",
      "GW0 is documentation and progression architecture only.",
      "ORTUS should move from a collection of sophisticated modeling screens toward a persistent research environment where worlds, experiments, evidence, questions, and reusable capabilities accumulate.",
      "Progression must organize learning and discovery without implying that the user has mastered reality, proven a mechanism, or completed a scientific domain.",
      "A Research World is an organized investigation context.",
      "It is not a literal game world, not a complete real-world domain simulation, not a domain authority",
      "Observe -> Perturb -> Compare -> Interpret -> Document -> Revisit -> Extend",
      "GW0 defines destination responsibilities. It does not implement destination navigation or persistence.",
      "World is the investigation context.",
      "Lab is where runnable model work happens.",
      "Atlas is the evidence-oriented record of investigated model behavior.",
      "Workshop is where reusable artifacts and modeling capabilities are prepared",
      "Current implemented workflows include `/`, `/builder`, template selection/runtime, Builder modes, schema authoring, graph inspection, validation/repair suggestions, structural fit reporting, scenario planning, Neural Runtime Lab, and current run controls/metrics.",
      "The Research World architecture must wrap and reorganize validated workflows before attempting to replace them.",
      "progress = reusable understanding + modeling capability + investigative depth",
      "progress = clicks + time + completed tasks",
      "Disproving an interpretation, documenting uncertainty, finding that a result is not robust, or discovering that the current model cannot support a conclusion are all meaningful progress.",
      "Research World progression is a flexible expansion of investigative capability, not a universal curriculum or player-level system.",
      "Contextual capability guidance is not the same as hard-locking tools.",
      "Progressive guidance and expert access must coexist.",
      "A Discovery Atlas records investigated model behavior.",
      "It does not certify discoveries about the real world.",
      "observation -> possible pattern -> supported modeled regime -> robust across tested conditions",
      "Contradictory runs are evidence.",
      "A behavioral landscape maps what has been investigated.",
      "It must not imply that unsampled regions are known.",
      "Persistent Model Lab is conceptual in GW0.",
      "Persistence must preserve provenance and model boundaries.",
      "Reusable does not mean universally compatible.",
      "Unresolved questions should remain visible.",
      "Finding that the model cannot support a conclusion is meaningful progress.",
      "A new modeling frontier expands the questions ORTUS can represent. It does not guarantee better answers.",
      "Composition is not automatic scientific coherence.",
      "Two valid components can be incompatible.",
      "Grand Systems Challenges should test model construction, interrogation, comparison, and scientific discipline—not optimization toward a scripted victory state.",
      "Beginners should receive a clear investigative starting point. Experts should not be forced through a simulated beginner journey.",
      "Research continuity should be supported without manufacturing urgency.",
      "Contextual guidance may respond to the state of the model and workspace. It must not become psychological profiling of the user.",
      "artifact attachment ≠ activation",
      "valid artifact ≠ runnable artifact",
      "runnable artifact ≠ scientifically validated model",
      "successful run ≠ robust result",
      "structural fit ≠ semantic correctness",
      "scenario plan ≠ executable scenario",
      "simulation output ≠ empirical truth",
      "Progression must not rely only on color, maps, animation, drag/drop, hover, or decorative metaphor.",
      "GW0 defines what the product must communicate. UX2 defines how shared design foundations communicate it. GW1 implements the first structural shell using both.",
      "GW0 -> UX2 -> GW1 -> GW1B -> GW2 -> GW2B -> GW3 -> GW3B -> GW4 -> GW4B -> GW5 -> GW5B -> GW6 -> GW6B",
      "Prompt GW1 implements the route contract:",
      "Lab and Atlas are reachable destinations, not locked destinations.",
      "no production UI, CSS, runtime, persistence, route, asset, dependency, or package file is changed by GW0"
    ]) {
      expect(researchWorldRoadmap).toContain(phrase);
    }
    expect(researchWorldRoadmap).not.toMatch(/XP[^.\n]*(implemented|added)|implemented[^.\n]*XP/i);
    for (const futureName of ["GW0", "GW1", "GW2", "GW3", "GW4", "GW5", "GW6"]) {
      expect(productPhilosophy).toContain(futureName);
    }
    expect(productPhilosophy).not.toMatch(/GW[2-6].*implemented/i);
    expect(productPhilosophy).toContain("GW4 adds a non-persistent Atlas foundation for evidence-state semantics");
    expect(productPhilosophy).toContain("GW1 implements only the shared World / Lab / Atlas / Workshop destination shell around existing workflows.");
    expect(productPhilosophy).not.toMatch(/XP.*implemented|implemented.*XP|streaks.*implemented|implemented.*streaks|grinding.*implemented|implemented.*grinding/i);
    for (const phrase of [
      "ORTUS Living Systems Atlas",
      "ORTUS should feel like a living system observed through precise scientific instruments, not a system under tactical command.",
      "The interface should preserve wonder without hiding uncertainty, assumptions, or model limits.",
      "Visual progression should correspond to real modeling capability and accumulated understanding, not arbitrary status or engagement rewards.",
      "The metaphor may organize the experience, but precise scientific labels must remain visible.",
      "ORTUS is an exploratory laboratory, not a tactical command interface.",
      "UX0 defines these destinations conceptually. It does not create routes, tabs, navigation, persistence, or runtime behavior.",
      "Contextual tools should respond to the modeled object under inspection instead of presenting every control permanently.",
      "Color must reinforce meaning, never carry it alone.",
      "Do not reintroduce next/font/google or any remote font dependency.",
      "Motion should communicate state, information flow, or system change—not decorate an otherwise static interface.",
      "Behavioral landscapes are scientific maps of investigated model behavior, not fantasy overworlds.",
      "Discovery styling should represent evidence accumulation, not achievement acquisition.",
      "visible lab growth = accumulated modeling capability",
      "visible lab growth = decorative XP reward",
      "Visual richness must not make scientific state, uncertainty, or controls harder to perceive.",
      "Do not rewrite the entire interface at once. Migrate through bounded, testable surfaces while preserving current workflows.",
      "UX0 defines the visual and interaction target. Research World prompts will determine how that target is implemented."
    ]) {
      expect(livingSystemsAtlas).toContain(phrase);
    }
    expect(livingSystemsAtlas).toContain("UX0 must not implement GW0-GW6.");
    expect(livingSystemsAtlas).toContain("Prompt UX1 completes the source-level inventory");
    expect(livingSystemsAtlas).toContain(
      "UX0 does not implement new routes, new navigation, a World/Lab/Atlas/Workshop shell, component redesigns"
    );
    expect(livingSystemsAtlas).not.toMatch(/next\/font\/google.*import/i);
    for (const phrase of [
      "UX1 audits the current interface. It does not redesign it.",
      "The audit must distinguish production evidence from assumptions and unverified visual behavior.",
      "The migration target is the Living Systems Atlas, but the audit must preserve current workflows and validated functionality.",
      "Retire tactical framing without flattening ORTUS into generic SaaS.",
      "Source inspection indicates a potential risk. Rendered verification has not been performed.",
      "successful operation is not the same as scientifically validated result",
      "Templates may have domain accents, but they should not behave like unrelated products.",
      "Migrate shared foundations before specialized surfaces, but do not block necessary feature work on a total redesign.",
      "UX1 provides implementation evidence. GW0 provides progression architecture. UX2 provides visual foundations. GW1 provides the first structural transformation.",
      "UX1 must not modify production CSS or UI components.",
      "No Tailwind configuration, CSS module files, Storybook, component-library package, icon package, chart package, graph package, animation package, local font files, or remote-font package was found.",
      "Remote fonts are absent.",
      "`next/font/google` is absent in app source.",
      "UX1 adds no dependencies and removes none."
    ]) {
      expect(existingDesignAudit).toContain(phrase);
    }
    for (const phrase of [
      "UX2 establishes shared visual semantics.",
      "It does not perform the Research World shell transformation.",
      "introduce semantic tokens",
      "preserve legacy compatibility",
      "migrate a small shared primitive set",
      "A visual state must communicate what kind of state it represents:",
      "operational, interaction, evidence, uncertainty, or capability.",
      "Operational success means the requested software operation completed.",
      "It does not mean the modeled conclusion was scientifically validated.",
      "contradicted is not failure",
      "unresolved is not error",
      "stale is not unsupported",
      "planning-only is not non-runnable for the same reason",
      "future-only is not disabled functionality",
      "Domain color identifies modeled content.",
      "Semantic color communicates interface and evidence state.",
      "UX2 prepares the visual language.",
      "GW1 performs the structural shell transformation."
    ]) {
      expect(semanticTokenFoundation).toContain(phrase);
    }
    for (const heading of [
      "## 3. Source Inventory",
      "## 4. Existing Token Inventory",
      "## 6. Component Inventory",
      "## 7. Retain / Adapt / Replace / Retire Matrix",
      "## 8. Marathon-Derived Conventions",
      "## 10. Responsive Risks",
      "## 11. Accessibility Risks",
      "## 12. Status And Evidence States",
      "## 17. Dependency Constraints",
      "## 18. Future Semantic Token Candidates",
      "## 19. Migration Risk Matrix",
      "## 20. Migration Waves",
      "## 21. UX2 Entry Criteria",
      "## 22. GW0/GW1 Relationship",
      "## 23. Verification Backlog",
      "## 24. Non-Goals And Guardrails"
    ]) {
      expect(existingDesignAudit).toContain(heading);
    }
    for (const sourceEvidence of [
      "src/app/globals.css",
      "src/components/AppShell.tsx",
      "src/components/builder/graph/BuilderGraphView.tsx",
      "src/components/NeuralRuntimeLabPanel.tsx",
      "src/lib/templateVisuals.ts",
      "package.json",
      "var(--muted)"
    ]) {
      expect(existingDesignAudit).toContain(sourceEvidence);
    }
    expect(existingDesignAudit).not.toMatch(/WCAG compliance.*verified/i);

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

  it("keeps README, concepts, simulation docs, product philosophy, and AGENTS aligned on future-pillar boundaries", () => {
    const docs = [
      readFileSync(join(repoRoot, "README.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "concepts.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "PRODUCT_PHILOSOPHY_AND_LEARNING_MISSION.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "RESEARCH_WORLD_PROGRESSION_MINI_ROADMAP.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "ui", "LIVING_SYSTEMS_ATLAS_VISUAL_DIRECTION.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "ui", "EXISTING_DESIGN_TOKEN_AND_COMPONENT_AUDIT.md"), "utf8"),
      readFileSync(join(repoRoot, "docs", "ui", "LIVING_SYSTEMS_ATLAS_SEMANTIC_TOKEN_FOUNDATION.md"), "utf8"),
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
    expect(docs).toContain("Prompt P0 is documentation only");
    expect(docs).toContain("Do not add XP, streaks, grinding, or engagement manipulation by default.");
    expect(docs).toContain("Treat UX0 as documentation and design planning only.");
    expect(docs).toContain("Do not implement World/Lab/Atlas/Workshop without a dedicated prompt.");
    expect(docs).toContain("UX1 audits the current interface. It does not redesign it.");
    expect(docs).toContain("The audit must distinguish production evidence from assumptions and unverified visual behavior.");
    expect(docs).toContain("Retire tactical framing without flattening ORTUS into generic SaaS.");
    expect(docs).toContain("Distinguish semantic tokens from repeated raw values.");
    expect(docs).toContain("Distinguish source evidence from rendered behavior.");
    expect(docs).toContain("Do not treat UX1 as UX2 or GW1, and do not start GW1 without a dedicated prompt.");
    expect(docs).toContain("GW1 implements the shared World/Lab/Atlas/Workshop destination shell only.");
    expect(docs).toContain("In GW1, \"persistent\" means structurally present across routes, not persistent user data.");
    expect(docs).toContain("Preserve `/` as World.");
    expect(docs).toContain("Preserve `/builder` as Workshop.");
    expect(docs).toContain("after GW4, Atlas is a non-persistent foundation route; after GW5, Lab is a non-persistent foundation route.");
    expect(docs).toContain("after GW5, GW5B is the next Research World audit prompt only with explicit approval.");
    expect(docs).toContain("UX2 establishes shared visual semantics. It does not perform the Research World shell transformation.");
    expect(docs).toContain("UX2 prepares the visual language. GW1 performs the structural shell transformation.");
    expect(docs).toContain("A visual state must communicate what kind of state it represents: operational, interaction, evidence, uncertainty, or capability.");
    expect(docs).toContain("Selected is not supported; active is not validated; hovered is not important.");
    expect(docs).toContain("Contradicted is not failure; unresolved is not error; stale is not unsupported; planning-only is not non-runnable for the same reason; future-only is not disabled functionality.");
    expect(docs).toContain("Prompt GW0 is documentation, product architecture, information architecture, and roadmap planning only.");
    expect(docs).toContain("Do not implement World, Lab, Atlas, Workshop, routes, navigation, pages, shell behavior, persistence");
    expect(docs).toContain("Artifact attachment is not runtime activation.");
    expect(docs).toContain("A Discovery Atlas records investigated model behavior, not certified real-world discoveries.");
    expect(docs).toContain("A connected graph is not proof that coupled runtime is meaningful.");
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
