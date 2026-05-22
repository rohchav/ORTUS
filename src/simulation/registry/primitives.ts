import type { PrimitiveId, SystemsPrimitiveEntry } from "./types";

const foundationDocs = ["README.md", "docs/concepts.md", "src/simulation/README.md"];
const roadmapDocs = ["docs/roadmap.md", "docs/missing-pillars.md"];

function primitive(entry: SystemsPrimitiveEntry): SystemsPrimitiveEntry {
  return entry;
}

function reservedPrimitive(
  id: PrimitiveId,
  label: string,
  description: string,
  futureScope: string,
  relatedPrimitives: readonly PrimitiveId[] = []
): SystemsPrimitiveEntry {
  return {
    id,
    label,
    description,
    status: "reserved",
    supportLevel: "documentation",
    currentScope: "Reserved in the roadmap only; no runtime, service, import/export, or UI behavior is implemented.",
    futureScope,
    limitations: ["Prompt 19 records the boundary only."],
    docsRefs: roadmapDocs,
    artifactTypes: [],
    relatedPrimitives,
    mustNotClaimYet: ["runtime support", "template support", "import/export support", "validated prediction"],
    promptIntroduced: "Prompt 18",
    promptAudit: "Prompt 18B"
  };
}

export const primitiveRegistry: readonly SystemsPrimitiveEntry[] = [
  primitive({
    id: "scenarios",
    label: "Scenarios",
    description: "Fresh-run recipes for template parameters, initialization, behavior modes, composition, and scenario notes.",
    status: "implemented",
    supportLevel: "runtime",
    currentScope: "Scenario Builder and engine scenario imports create fresh runs without storing live world state.",
    futureScope: "Future schema work can attach additional validated primitive references behind capability checks.",
    limitations: ["Scenarios are not snapshots and do not replay mid-run intervention history."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.scenario"],
    relatedPrimitives: ["behaviorModes", "agentComposition", "assumptions", "uncertainty"],
    mustNotClaimYet: ["mid-run replay", "full model definition support"],
    promptIntroduced: "Prompt 6",
    promptAudit: "Prompt 6B"
  }),
  primitive({
    id: "snapshots",
    label: "Snapshots",
    description: "Exact engine-state exports for deterministic continuation.",
    status: "implemented",
    supportLevel: "runtime",
    currentScope: "Snapshot export/import preserves world, RNG, and metric history for restore.",
    futureScope: "Future versioning work should add migration metadata and compatibility checks.",
    limitations: ["Snapshots are live run state, not scenario recipes or model definitions."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.snapshot"],
    relatedPrimitives: ["scenarios"],
    mustNotClaimYet: ["scenario semantics", "cross-version migration"],
    promptIntroduced: "Prompt 1"
  }),
  primitive({
    id: "behaviorModes",
    label: "Behavior Modes",
    description: "Template-owned selectable behavior variants with validated parameter/composition references.",
    status: "implemented",
    supportLevel: "runtime",
    currentScope: "Production templates expose behavior mode definitions that are applied through validated fresh-run configuration.",
    futureScope: "Future rule primitives may formalize behavior mode internals.",
    limitations: ["Behavior modes are template-defined, not arbitrary UI-authored rules."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.scenario"],
    relatedPrimitives: ["scenarios", "agentComposition", "rulePrimitiveLibrary"],
    mustNotClaimYet: ["visual rule editing", "arbitrary formulas"],
    promptIntroduced: "Prompt 8",
    promptAudit: "Prompt 8B"
  }),
  primitive({
    id: "agentComposition",
    label: "Agent Composition",
    description: "Template-owned initial composition controls for fresh-run setup.",
    status: "implemented",
    supportLevel: "runtime",
    currentScope: "Production templates expose bounded composition fields used during initialization.",
    futureScope: "Future heterogeneity and adaptive-agent phases can expand composition into richer population structure.",
    limitations: ["Composition is initial-condition metadata, not adaptive behavior or internal memory."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.scenario"],
    relatedPrimitives: ["scenarios", "heterogeneity", "adaptiveAgents"],
    mustNotClaimYet: ["adaptive agents", "full heterogeneity layer"],
    promptIntroduced: "Prompt 9",
    promptAudit: "Prompt 9B"
  }),
  primitive({
    id: "uncertainty",
    label: "Uncertainty",
    description: "Headless sampling over validated safe RunConfig parameter targets.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Uncertainty services generate deterministic ensembles and summaries without implying calibration.",
    futureScope: "Later validation and calibration phases can add evidence-backed uncertainty semantics.",
    limitations: ["Uncertainty ranges are user assumptions unless calibrated against data."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.uncertaintyConfig", "ortus.uncertaintyResult"],
    relatedPrimitives: ["scenarios", "validationCalibration"],
    mustNotClaimYet: ["calibrated probabilities", "real-world confidence intervals"],
    promptIntroduced: "Prompt 12",
    promptAudit: "Prompt 12B"
  }),
  primitive({
    id: "assumptions",
    label: "Assumptions, Limits + Ethics",
    description: "Structured modeling-transparency metadata for assumptions, limits, not-represented fields, use boundaries, and validation status.",
    status: "metadataOnly",
    supportLevel: "metadata",
    currentScope: "Template and scenario assumption metadata is visible, summarized, validated, and service-exportable.",
    futureScope: "Future model critique and validation phases can use these profiles as review context.",
    limitations: ["Assumption profiles do not affect engine dynamics or certify validity."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.assumptionProfile"],
    relatedPrimitives: ["scenarios", "humanModelCritique", "validationCalibration"],
    mustNotClaimYet: ["prediction certification", "legal compliance", "external validation without evidence"],
    promptIntroduced: "Prompt 14",
    promptAudit: "Prompt 14B"
  }),
  primitive({
    id: "networks",
    label: "Networks + Relations",
    description: "Headless relational primitives for network definitions, generation, query helpers, metrics, and serialization.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Network services exist, but no current production template runtime uses network topology.",
    futureScope: "Future network-capable templates and hybrid composition can attach topology behind explicit capabilities.",
    limitations: ["Network edges are not causal links or real-world social-network evidence."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.networkDefinition", "ortus.networkMetrics"],
    relatedPrimitives: ["hybridComposition", "causalAssumptions", "spatialFields"],
    mustNotClaimYet: ["template runtime support", "causal influence", "network visual editor"],
    promptIntroduced: "Prompt 15",
    promptAudit: "Prompt 15B"
  }),
  primitive({
    id: "resources",
    label: "Resources, Stocks + Flows",
    description: "Headless resource, stock, flow, operation, metric, query, and serialization primitives.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Resource services exist, but no current production template runtime uses resource state or stock-flow logic.",
    futureScope: "Future resource-capable templates can attach stocks and flows behind explicit capabilities.",
    limitations: ["Resource metrics do not prove economic, ecological, or health outcomes."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.resourceSystem", "ortus.resourceMetrics"],
    relatedPrimitives: ["hybridComposition", "feedbackEvents", "networks"],
    mustNotClaimYet: ["template runtime support", "feedback loops", "resource-network hybrids"],
    promptIntroduced: "Prompt 16",
    promptAudit: "Prompt 16B"
  }),
  primitive({
    id: "feedbackEvents",
    label: "Feedback, Delays + Events",
    description: "Headless event schedule, delay queue, feedback loop metadata, metric, query, and serialization primitives.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Feedback/event services exist, but no current production template runtime uses scheduled events, delays, or feedback loops.",
    futureScope: "Future templates can wire deterministic events, delayed effects, and feedback adjustments behind explicit capabilities.",
    limitations: ["Loop classification is metadata, not causal discovery or proof."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.eventSchedule", "ortus.delayQueue", "ortus.feedbackLoops", "ortus.feedbackEventMetrics"],
    relatedPrimitives: ["resources", "networks", "causalAssumptions"],
    mustNotClaimYet: ["template runtime support", "causal proof", "control optimization"],
    promptIntroduced: "Prompt 17",
    promptAudit: "Prompt 17B"
  }),
  primitive({
    id: "hybridComposition",
    label: "Hybrid Model Composition",
    description: "Headless structural composition metadata for intended primitive combinations.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Composition services validate, serialize, summarize, and report missing capabilities without executing custom hybrid models.",
    futureScope: "Future phases may use valid compositions as planning inputs for schema-backed hybrid runtime work.",
    limitations: ["A valid composition may be non-runnable; attaching artifacts does not activate template behavior."],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.hybridComposition"],
    relatedPrimitives: ["networks", "resources", "feedbackEvents", "modelDefinitionSchema"],
    mustNotClaimYet: ["runtime execution", "model compiler", "visual builder", "automatic primitive wiring"],
    promptIntroduced: "Prompt 20"
  }),
  primitive({
    id: "multiScale",
    label: "Multi-Scale Systems",
    description: "Headless structural scale levels, entity types, aggregation rules, disaggregation rules, and cross-scale links.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Scale-model services validate, serialize, query, and summarize multi-scale structure without executing aggregation/disaggregation.",
    futureScope: "Future runtime phases may execute explicit scale transitions behind template capabilities; Prompt 22 handles scale-aware views.",
    limitations: [
      "No current production template executes multi-scale dynamics.",
      "No zoom UI or scale-aware canvas rendering is implemented.",
      "Aggregation can lose information and disaggregation can create synthetic detail."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.scaleModel"],
    relatedPrimitives: ["scaleAwareViews", "agentComposition", "hybridComposition"],
    mustNotClaimYet: ["template runtime support", "camera zoom support", "runtime aggregation/disaggregation", "scale-aware rendering"],
    promptIntroduced: "Prompt 21"
  }),
  primitive({
    id: "scaleAwareViews",
    label: "Scale-Aware Views",
    description: "Headless scale view state and model-scale transition metadata separate from camera zoom.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Scale-view services validate, serialize, summarize, and navigate structural scale models without changing renderer behavior.",
    futureScope: "Future UI phases may connect scale view state to scale-aware navigation controls and renderer affordances.",
    limitations: [
      "No current production template executes scale-aware view behavior.",
      "No full renderer rewrite or scale-aware canvas rendering is implemented.",
      "Scale transitions in V1 do not execute aggregation or disaggregation rules."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.scaleViewState"],
    relatedPrimitives: ["multiScale", "hybridComposition"],
    mustNotClaimYet: ["template runtime support", "camera zoom support", "renderer integration", "runtime aggregation/disaggregation"],
    promptIntroduced: "Prompt 22"
  }),
  primitive({
    id: "boundariesEnvironment",
    label: "Boundaries + Environment",
    description: "Headless structural system boundary, environment scope, exchange, external forcing, and exogenous shock metadata.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Boundary/environment services validate, serialize, query, and summarize system scope and environment declarations without executing exchanges, forcings, or shocks.",
    futureScope: "Future runtime phases may connect explicit boundary models to resource, event, environment, and spatial-field execution behind template capabilities.",
    limitations: [
      "No current production template executes boundary/environment behavior.",
      "No spatial field engine is implemented.",
      "Active boundary exchanges are structural declarations, not runtime-executed flows."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.boundaryModel"],
    relatedPrimitives: ["resources", "feedbackEvents", "spatialFields", "hybridComposition"],
    mustNotClaimYet: ["template runtime support", "spatial field simulation", "runtime exchange execution", "causal proof"],
    promptIntroduced: "Prompt 23"
  }),
  primitive({
    id: "spatialFields",
    label: "Spatial Fields + Environmental Layers",
    description: "Headless structural coordinate spaces, spatial fields, environmental layers, and sampling metadata.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope: "Spatial-field services validate, serialize, query, and summarize coordinate spaces, field definitions, environmental layers, and sampling declarations without executing sampling, interpolation, diffusion, advection, or rendering.",
    futureScope: "Future runtime phases may connect explicit SpatialFieldModel artifacts to template field sampling, environmental coupling, diffusion/advection, or GIS/renderer integrations behind template capabilities.",
    limitations: [
      "No current production template executes spatial-field behavior.",
      "No runtime field sampling, interpolation, diffusion, or advection is implemented.",
      "No renderer, terrain renderer, or GIS engine is implemented."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.fieldLayer"],
    relatedPrimitives: ["boundariesEnvironment", "resources", "networks", "hybridComposition", "observability"],
    mustNotClaimYet: [
      "template runtime support",
      "runtime field sampling or interpolation",
      "diffusion or advection",
      "calibrated probability fields",
      "renderer or GIS support"
    ],
    promptIntroduced: "Prompt 24"
  }),
  reservedPrimitive("temporalScale", "Temporal Scale + Multi-Rate Time", "Fast/slow variables, event time, tick time, lags, and multi-rate schedules.", "A future prompt will define temporal-scale primitives.", [
    "feedbackEvents"
  ]),
  primitive({
    id: "observability",
    label: "Observability + Measurement",
    description: "Headless structural observable variables, latent variables, measurements, schedules, and measurement-process metadata.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Observability services provide structural/service-level measurement definitions only: they validate, serialize, query, and summarize measurement metadata without collecting runtime data, ingesting external data, calibrating, inferring, validating, or assimilating data.",
    futureScope:
      "Future validation/calibration phases may connect explicit measurement models to evidence, calibration, data assimilation, and observation execution behind capability checks.",
    limitations: [
      "No current production template executes observability behavior.",
      "No runtime measurement execution, external data ingestion, inference, calibration, or data assimilation is implemented.",
      "Runtime metrics are model outputs; they are not automatically empirical observations."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.observabilityModel"],
    relatedPrimitives: ["validationCalibration", "assumptions", "causalAssumptions", "hybridComposition"],
    mustNotClaimYet: [
      "template runtime support",
      "runtime observation collection",
      "external data ingestion",
      "calibration or empirical validation",
      "data assimilation or inference",
      "causal proof"
    ],
    promptIntroduced: "Prompt 25"
  }),
  primitive({
    id: "causalAssumptions",
    label: "Causal Assumptions + Influence Structure",
    description: "Headless structural causal assumption, influence edge, evidence, and intervention-relevance metadata.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Causal-assumption services provide structural/service-level causal assumption and influence declarations only: they validate, serialize, query, and summarize influence metadata without discovery, causal proof, do-calculus execution, inference, optimization, validation, or calibration.",
    futureScope:
      "Future validation, calibration, and control phases may use explicit causal assumption models as review inputs behind capability checks.",
    limitations: [
      "No current production template executes causal-assumption behavior.",
      "No causal discovery, causal proof, inference, do-calculus execution, structural equation solving, intervention optimization, or calibration is implemented.",
      "Network edges, feedback labels, runtime metrics, and observations are not causal evidence by themselves."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.causalAssumptionModel"],
    relatedPrimitives: ["networks", "feedbackEvents", "observability", "validationCalibration", "interventionStrategy", "hybridComposition"],
    mustNotClaimYet: [
      "template runtime support",
      "causal discovery",
      "causal proof",
      "do-calculus execution",
      "inference",
      "structural equation solving",
      "intervention optimization",
      "calibration or empirical validation"
    ],
    promptIntroduced: "Prompt 26"
  }),
  primitive({
    id: "emergenceDetection",
    label: "Emergence Detection + Pattern Descriptors",
    description: "Headless structural descriptors for candidate emergent patterns, signatures, thresholds, time windows, variables, and scale links.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Emergence-pattern services provide structural/service-level pattern descriptors only: they validate, serialize, query, and summarize candidate pattern metadata without runtime detection, proof of emergence, statistical significance testing, ML pattern mining, external validation, or calibration.",
    futureScope:
      "Future validation, comparison, visual-builder, and runtime phases may use explicit EmergencePatternModel artifacts for bounded pattern detection behind capability checks.",
    limitations: [
      "No current production template executes emergence-detection behavior.",
      "No runtime pattern detection, snapshot or metric-history mining, statistical significance testing, ML clustering, anomaly detection, proof of emergence, external validation, or calibration is implemented.",
      "Visual patterns and runtime metrics are model outputs, not empirical proof of emergence."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.emergencePatternModel"],
    relatedPrimitives: [
      "observability",
      "causalAssumptions",
      "unitsDimensionalConsistency",
      "multiScale",
      "scaleAwareViews",
      "robustnessResilience",
      "phaseTransitions",
      "attractorsBasins",
      "validationCalibration",
      "hybridComposition"
    ],
    mustNotClaimYet: [
      "template runtime support",
      "runtime pattern detection",
      "proof of emergence",
      "statistical significance testing",
      "ML clustering or anomaly detection",
      "external validation",
      "calibration or empirical validation",
      "consciousness or intelligence detection"
    ],
    promptIntroduced: "Prompt 28"
  }),
  reservedPrimitive("phaseTransitions", "Phase Transitions + Tipping Points", "Threshold sweeps, regime changes, hysteresis, and early-warning indicators.", "A future prompt will define phase-transition tools.", [
    "emergenceDetection",
    "robustnessResilience"
  ]),
  reservedPrimitive("attractorsBasins", "Attractors + Basins", "Trajectory convergence, cycles, recurrence, basin mapping, and sensitivity to initial conditions.", "Prompt 30 will define attractor and basin tools.", [
    "phaseTransitions",
    "uncertainty"
  ]),
  primitive({
    id: "robustnessResilience",
    label: "Robustness, Resilience + Stress Testing Semantics",
    description: "Headless structural descriptors for stressors, response criteria, failure modes, and stress-test plans.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Robustness/resilience services provide structural/service-level robustness, resilience, perturbation, and stress-test semantics only: they validate, serialize, query, and summarize metadata without runtime stress testing, automatic perturbation, statistical validation, safety certification, operational risk assessment, control optimization, or calibration.",
    futureScope:
      "Future experiment, validation, control, and runtime phases may use explicit RobustnessResilienceModel artifacts for bounded stress testing behind capability checks.",
    limitations: [
      "No current production template executes robustness/resilience behavior.",
      "No runtime stress testing, automatic perturbation, statistical validation, safety certification, operational risk assessment, control optimization, external validation, or calibration is implemented.",
      "Uncertainty ensembles, runtime metrics, and visual persistence are not robustness validation by themselves."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.robustnessResilienceModel"],
    relatedPrimitives: [
      "uncertainty",
      "emergenceDetection",
      "causalAssumptions",
      "observability",
      "unitsDimensionalConsistency",
      "boundariesEnvironment",
      "resources",
      "feedbackEvents",
      "interventionStrategy",
      "validationCalibration",
      "hybridComposition"
    ],
    mustNotClaimYet: [
      "template runtime support",
      "runtime stress testing",
      "automatic perturbation",
      "statistical validation",
      "safety certification",
      "operational risk assessment",
      "control or intervention optimization",
      "calibration or empirical validation",
      "system robustness or resilience proof"
    ],
    promptIntroduced: "Prompt 29"
  }),
  primitive({
    id: "interventionStrategy",
    label: "Strategy, Control + Intervention Semantics",
    description: "Headless structural descriptors for strategies, intervention options, triggers, objectives, constraints, policies, stopping rules, and expected effects.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Control-strategy services provide structural/service-level strategy, control, policy, and intervention semantics only: they validate, serialize, query, and summarize metadata without runtime policy execution, automatic intervention execution, control optimization, reinforcement learning, model predictive control, causal effect estimation, safety certification, operational decision support, validation, or calibration.",
    futureScope:
      "Future runtime, experiment-planning, validation, and control phases may use explicit ControlStrategyModel artifacts behind capability checks.",
    limitations: [
      "No current production template executes ControlStrategyModel behavior.",
      "No runtime policy execution, automatic intervention execution, closed-loop control, control optimization, reinforcement learning, model predictive control, causal effect estimation, safety certification, operational decision support, external validation, or calibration is implemented.",
      "Template-owned runtime interventions are not the same as general strategy/control support."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.controlStrategyModel"],
    relatedPrimitives: [
      "causalAssumptions",
      "observability",
      "robustnessResilience",
      "uncertainty",
      "resources",
      "feedbackEvents",
      "networks",
      "boundariesEnvironment",
      "unitsDimensionalConsistency",
      "validationCalibration",
      "hybridComposition"
    ],
    mustNotClaimYet: [
      "template runtime support",
      "runtime policy execution",
      "automatic intervention execution",
      "closed-loop control",
      "control or intervention optimization",
      "reinforcement learning",
      "model predictive control",
      "causal effect estimation",
      "policy recommendation",
      "safety certification",
      "operational decision support",
      "calibration or empirical validation",
      "optimal strategy claims"
    ],
    promptIntroduced: "Prompt 30"
  }),
  reservedPrimitive("adaptiveAgents", "Adaptive Agents", "Internal state, memory, perception, strategy switching, bounded rationality, and learning placeholders.", "Prompts 32-33 will define internal state and adaptation.", [
    "agentComposition",
    "heterogeneity"
  ]),
  reservedPrimitive("heterogeneity", "Heterogeneity", "Agent types, group differences, parameter distributions, and structural/behavioral heterogeneity.", "Prompt 34 will define a heterogeneity layer.", [
    "agentComposition",
    "adaptiveAgents"
  ]),
  reservedPrimitive("explainabilityTrace", "Explainability + Trace Inspection", "Rule, event, resource, feedback, and agent-change trace inspection.", "Prompt 35 will define trace artifacts and explainability services.", [
    "feedbackEvents",
    "resources",
    "rulePrimitiveLibrary"
  ]),
  reservedPrimitive("errorBudgets", "Error Budgets + Approximation Warnings", "Aggregation loss, sampling error, simplification warnings, and omitted-variable risk.", "Prompt 36 will define approximation warning metadata.", [
    "multiScale",
    "observability"
  ]),
  primitive({
    id: "unitsDimensionalConsistency",
    label: "Units, Dimensions + Quantity Semantics",
    description: "Headless structural unit definitions, dimension definitions, quantity semantics, ranges, and compatibility-rule metadata.",
    status: "serviceOnly",
    supportLevel: "service",
    currentScope:
      "Quantity-semantics services provide structural/service-level unit, dimension, quantity, range, and compatibility declarations only: they validate, serialize, query, and summarize metadata without runtime unit enforcement, automatic conversion, symbolic algebra, dimensional equation solving, validation, or calibration.",
    futureScope:
      "Future schema, compiler, validation, and runtime phases may use explicit QuantitySemanticsModel artifacts for unit-aware checks and bounded conversion behind capability checks.",
    limitations: [
      "No current production template executes quantity-semantics behavior.",
      "No runtime unit enforcement, automatic conversion, symbolic algebra, dimensional equation solving, or calibration is implemented.",
      "Parameter labels, metric labels, and numeric bounds are not the same as full unit and dimension semantics."
    ],
    docsRefs: foundationDocs,
    artifactTypes: ["ortus.quantitySemanticsModel"],
    relatedPrimitives: ["resources", "feedbackEvents", "observability", "causalAssumptions", "temporalScale", "hybridComposition", "validationCalibration"],
    mustNotClaimYet: [
      "template runtime support",
      "runtime unit enforcement",
      "automatic unit conversion",
      "symbolic algebra",
      "dimensional equation solving",
      "calibration or empirical validation",
      "physical-time rates without explicit mapping"
    ],
    promptIntroduced: "Prompt 27"
  }),
  reservedPrimitive("modelDefinitionSchema", "Model Definition Schema", "Versioned model schemas for future custom/hybrid models.", "Prompt 43 will define model definition schemas.", [
    "safeInterpreterCompiler",
    "visualModelBuilder"
  ]),
  reservedPrimitive("rulePrimitiveLibrary", "Rule Primitive Library", "Safe reusable rule primitives for model definitions.", "Prompt 46 will define rule primitives.", [
    "behaviorModes",
    "safeInterpreterCompiler"
  ]),
  reservedPrimitive("safeInterpreterCompiler", "Safe Interpreter/Compiler", "Bounded execution of validated model definitions and rule primitives.", "Prompts 47-48 will define interpretation and execution safety.", [
    "modelDefinitionSchema",
    "rulePrimitiveLibrary"
  ]),
  reservedPrimitive("visualModelBuilder", "Visual Model Builder", "Visual authoring over validated schemas and safe rule primitives.", "Prompts 49-59 will define visual builder features.", [
    "modelDefinitionSchema",
    "safeInterpreterCompiler"
  ]),
  reservedPrimitive("humanModelCritique", "Human-In-The-Loop Model Critique", "Structured critique prompts for missing variables, boundaries, scale, observability, and falsification.", "Prompts 60-62 will define model critique workflows.", [
    "assumptions",
    "observability"
  ]),
  reservedPrimitive("patternLibraries", "Pattern Libraries", "Reusable pattern definitions such as contagion, diffusion, depletion, and cascades.", "Prompts 63-65 will define pattern libraries.", [
    "domainPacks",
    "modelDefinitionSchema"
  ]),
  reservedPrimitive("domainPacks", "Domain Packs", "Curated domain-specific packs for ecology, epidemiology, infrastructure, supply chains, and organizations.", "Prompts 66-68 will define domain packs.", [
    "patternLibraries",
    "assumptions"
  ]),
  reservedPrimitive("validationCalibration", "Validation, Calibration + Data Assimilation", "Pattern validation, calibration, sensitivity, MCMC, and data assimilation.", "Prompts 69-75 will define validation and calibration tools.", [
    "observability",
    "uncertainty"
  ]),
  reservedPrimitive("externalFrameworkInterop", "External Framework Interop", "Adapters for Mesa, NetLogo, MASON, and related frameworks.", "Prompts 81-85 will define framework adaptation contracts.", [
    "modelDefinitionSchema"
  ]),
  reservedPrimitive("performanceScale", "Performance, Scale + Runtime Infrastructure", "Bounded scale, runtime optimization, workers, and large-run infrastructure.", "Prompts 86-91 will define performance and scale work.", [
    "safeInterpreterCompiler"
  ]),
  reservedPrimitive("securityProjectHardening", "Security, Imports + Recovery UX", "Security hardening, import boundaries, save/load, accessibility, and recovery UX.", "Prompts 92-96 will define hardening work.", [
    "modelDefinitionSchema",
    "visualModelBuilder"
  ]),
  reservedPrimitive("productization", "Productization", "Packaging and product-readiness work after modeling foundations and audits.", "Prompts 97-102 will define productization.", [
    "securityProjectHardening"
  ])
] as const;
