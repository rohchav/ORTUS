export const rawStarterWorldPackDefinitions = [
  {
    id: "local-rules-global-patterns",
    version: "1",
    slug: "local-rules-global-patterns",
    title: "Local Rules, Global Patterns",
    shortTitle: "Local Rules",
    hook: "How can small local differences create large visible changes?",
    summary:
      "Four prepared pairs isolate noise, outbreak geometry, predator pressure, and landscape connectivity inside existing runnable models.",
    theme:
      "Local interaction, initial conditions, delayed feedback, and spatial paths can reorganize aggregate model behavior without adding a global director.",
    featuredWorldId: "coordination-under-sensor-noise",
    worldIds: [
      "coordination-under-sensor-noise",
      "clustered-outbreak-starts",
      "predator-pressure-recovery",
      "patch-density-firebreaks"
    ],
    mechanisms: [
      "local-neighbor",
      "spatial-contact",
      "contagion",
      "predation",
      "feedback",
      "stochastic-transition"
    ],
    systemForms: ["spatial-agents", "grid", "population"],
    comparisonPurpose:
      "Run one bounded baseline and one contrast, then inspect named model outputs while keeping the rest of each pair controlled.",
    researchBoundary:
      "These are prepared comparisons inside stylized models. They are not empirical experiments or evidence that the same pattern governs unrelated real systems."
  }
];

export const rawStarterWorldLaunchRecipes = [
  {
    id: "coordination-clear-signals",
    version: "1",
    starterWorldId: "coordination-under-sensor-noise",
    title: "Clear local signals",
    shortDescription: "Boids use the Random Headings start with only slight seeded steering noise.",
    purpose: "Establish a low-noise reference for the speed and coherence of local alignment.",
    templateId: "flocking-boids",
    initializationPresetId: "random-headings",
    parameterOverrides: { noise: 0.01 },
    seed: "c2-coordination-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 240,
    outputsToWatch: ["alignmentScore", "dispersion"],
    modelBoundary:
      "This is abstract steering behavior, not animal-behavior validation, autonomous-vehicle safety evidence, or an optimized swarm controller.",
    visualCue: "Watch headings organize and note whether one coherent moving group remains visible.",
    comparisonRole: "baseline"
  },
  {
    id: "coordination-noisy-signals",
    version: "1",
    starterWorldId: "coordination-under-sensor-noise",
    title: "Noisy local signals",
    shortDescription: "The same seeded Random Headings start uses stronger bounded steering noise.",
    purpose: "Inspect whether stronger local uncertainty delays coordination or leaves visible subgroups.",
    templateId: "flocking-boids",
    initializationPresetId: "random-headings",
    parameterOverrides: { noise: 0.28 },
    seed: "c2-coordination-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 240,
    outputsToWatch: ["alignmentScore", "dispersion"],
    modelBoundary:
      "This is abstract steering behavior, not animal-behavior validation, autonomous-vehicle safety evidence, or an optimized swarm controller.",
    visualCue: "Watch for persistent heading disagreement, wider spread, or multiple visible moving subgroups.",
    comparisonRole: "contrast"
  },
  {
    id: "outbreak-one-cluster",
    version: "1",
    starterWorldId: "clustered-outbreak-starts",
    title: "One concentrated cluster",
    shortDescription: "Nine initial infections begin nearest one fixed center in the moving population.",
    purpose: "Create one concentrated source from which local contact spread can expand.",
    templateId: "epidemic-spread",
    initializationPresetId: "single-cluster-outbreak",
    parameterOverrides: { initialInfected: 9 },
    initializationOptions: { initialInfectedCount: 9, centerX: 50, centerY: 50 },
    seed: "c2-outbreak-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 240,
    outputsToWatch: ["infectedCount", "recoveredCount"],
    modelBoundary:
      "This stylized contact process is not a forecast, a calibrated disease model, public-health guidance, or policy advice.",
    visualCue: "Watch one infected pocket expand through nearby contacts and follow its model-agent count over time.",
    comparisonRole: "baseline"
  },
  {
    id: "outbreak-separated-hotspots",
    version: "1",
    starterWorldId: "clustered-outbreak-starts",
    title: "Several separated hotspots",
    shortDescription: "The same nine initial infections are distributed near three seeded hotspot centers.",
    purpose: "Inspect whether separated local starts remain distinct or merge into a broader model wave.",
    templateId: "epidemic-spread",
    initializationPresetId: "multiple-hotspots",
    parameterOverrides: { initialInfected: 9 },
    initializationOptions: { initialInfectedCount: 9, hotspotCount: 3 },
    seed: "c2-outbreak-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 240,
    outputsToWatch: ["infectedCount", "recoveredCount"],
    modelBoundary:
      "This stylized contact process is not a forecast, a calibrated disease model, public-health guidance, or policy advice.",
    visualCue: "Watch separated infected pockets, their propagation paths, and whether those pockets visibly coalesce.",
    comparisonRole: "contrast"
  },
  {
    id: "predator-recovery-margin",
    version: "1",
    starterWorldId: "predator-pressure-recovery",
    title: "Recovery margin",
    shortDescription: "A prey-heavy seeded field begins with two predators and otherwise standard mechanics.",
    purpose: "Provide a lower-pressure starting ratio for following prey recovery and population cycles.",
    templateId: "predator-prey",
    initializationPresetId: "random-ecology",
    parameterOverrides: { initialPrey: 160, initialPredators: 2 },
    seed: "c2-predator-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 400,
    outputsToWatch: ["preyCount", "predatorCount"],
    modelBoundary:
      "This does not reproduce a specific ecosystem and is not conservation forecasting or ecological policy evidence.",
    visualCue: "Watch whether prey remain present after early encounters and whether either population begins a visible cycle.",
    comparisonRole: "baseline"
  },
  {
    id: "predator-high-pressure",
    version: "1",
    starterWorldId: "predator-pressure-recovery",
    title: "High predator pressure",
    shortDescription: "The same seeded field and prey count begin with twelve predators.",
    purpose: "Inspect how a higher starting predator ratio changes prey persistence and later predator counts.",
    templateId: "predator-prey",
    initializationPresetId: "random-ecology",
    parameterOverrides: { initialPrey: 160, initialPredators: 12 },
    seed: "c2-predator-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 400,
    outputsToWatch: ["preyCount", "predatorCount"],
    modelBoundary:
      "This does not reproduce a specific ecosystem and is not conservation forecasting or ecological policy evidence.",
    visualCue: "Watch for early prey decline, predator depletion, extinction states, and any later model-population recovery.",
    comparisonRole: "contrast"
  },
  {
    id: "fire-connected-fuel",
    version: "1",
    starterWorldId: "patch-density-firebreaks",
    title: "Connected fuel",
    shortDescription: "A central ignition begins in a fully connected fuel grid with deterministic local spread.",
    purpose: "Provide an uninterrupted spatial path against which the corridor layout can be compared.",
    templateId: "forest-fire",
    initializationPresetId: "central-ignition",
    parameterOverrides: { spreadProbability: 1, neighborMode: "vonNeumann", boundaryMode: "closed" },
    seed: "c2-firebreak-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 100,
    outputsToWatch: ["activeFireCount", "burnedTotalCount", "extinguished"],
    modelBoundary:
      "This is not a calibrated wildfire model and includes no weather, terrain, suppression, evacuation, risk assessment, or real-world safety claim.",
    visualCue: "Watch the front cross the connected grid and follow active and burned model-cell counts.",
    comparisonRole: "baseline"
  },
  {
    id: "fire-corridor-break",
    version: "1",
    starterWorldId: "patch-density-firebreaks",
    title: "Firebreak corridor",
    shortDescription: "The same central start includes one full-height corridor of existing empty cell state.",
    purpose: "Inspect whether an actual nonburnable path interrupts otherwise connected local spread.",
    templateId: "forest-fire",
    initializationPresetId: "firebreak-corridor",
    parameterOverrides: { spreadProbability: 1, neighborMode: "vonNeumann", boundaryMode: "closed" },
    seed: "c2-firebreak-001",
    recommendedTask: "observe",
    suggestedRunHorizon: 100,
    outputsToWatch: ["activeFireCount", "burnedTotalCount", "extinguished"],
    modelBoundary:
      "This is not a calibrated wildfire model and includes no weather, terrain, suppression, evacuation, risk assessment, or real-world safety claim.",
    visualCue: "Watch whether the front reaches but does not cross the full-height empty-cell corridor.",
    comparisonRole: "contrast"
  }
];

export const rawPreparedStarterComparisonDeclarations = [
  {
    id: "coordination-noise-comparison",
    version: "1",
    starterWorldId: "coordination-under-sensor-noise",
    title: "Clear signals versus noisy signals",
    question: "How does bounded steering noise change coordination under the same seeded start?",
    baselineRecipeId: "coordination-clear-signals",
    contrastRecipeId: "coordination-noisy-signals",
    outputsToCompare: ["alignmentScore", "dispersion"],
    suggestedProcedure: [
      "Launch Clear local signals and run it for 240 ticks.",
      "Use the existing World Compare task to save its bounded run summary.",
      "Launch Noisy local signals and run it for the same 240 ticks.",
      "Inspect alignment and dispersion alongside visible subgroup formation."
    ],
    expectedPattern:
      "Compare whether stronger steering noise delays common direction, lowers alignment, widens dispersion, or leaves visible subgroups under this seed.",
    interpretationBoundary:
      "A difference inside this stylized pair does not establish a universal noise threshold, controller safety, robustness, or behavior in real moving groups."
  },
  {
    id: "outbreak-geometry-comparison",
    version: "1",
    starterWorldId: "clustered-outbreak-starts",
    title: "One cluster versus several hotspots",
    question: "When do separated infected pockets merge into a broader model wave?",
    baselineRecipeId: "outbreak-one-cluster",
    contrastRecipeId: "outbreak-separated-hotspots",
    outputsToCompare: ["infectedCount", "recoveredCount"],
    suggestedProcedure: [
      "Launch One concentrated cluster and run it for 240 ticks.",
      "Use the existing World Compare task to save its bounded run summary.",
      "Launch Several separated hotspots and run it for the same 240 ticks.",
      "Compare infection-count histories and inspect whether visible pockets coalesce."
    ],
    expectedPattern:
      "Watch for differences in the timing and shape of infected and recovered counts as one cluster or several seeded hotspots propagate locally.",
    interpretationBoundary:
      "The pair isolates model initialization geometry; it does not forecast disease spread, estimate public-health risk, or support policy advice."
  },
  {
    id: "predator-pressure-comparison",
    version: "1",
    starterWorldId: "predator-pressure-recovery",
    title: "Recovery margin versus high pressure",
    question: "How does the starting predator ratio change prey persistence and later population motion?",
    baselineRecipeId: "predator-recovery-margin",
    contrastRecipeId: "predator-high-pressure",
    outputsToCompare: ["preyCount", "predatorCount"],
    suggestedProcedure: [
      "Launch Recovery margin and run it for 400 ticks.",
      "Use the existing World Compare task to save its bounded run summary.",
      "Launch High predator pressure and run it for the same 400 ticks.",
      "Compare prey and predator histories, including any zero-count state or recovery."
    ],
    expectedPattern:
      "Compare whether higher initial predator pressure produces earlier prey decline, altered cycle timing, or a different extinction state in this seeded model.",
    interpretationBoundary:
      "These model-agent counts do not reproduce a particular ecosystem or provide conservation forecasts, ecological policy evidence, or robustness claims."
  },
  {
    id: "firebreak-path-comparison",
    version: "1",
    starterWorldId: "patch-density-firebreaks",
    title: "Connected paths versus an interrupted corridor",
    question: "Does one continuous nonburnable corridor interrupt spread across an otherwise connected grid?",
    baselineRecipeId: "fire-connected-fuel",
    contrastRecipeId: "fire-corridor-break",
    outputsToCompare: ["activeFireCount", "burnedTotalCount", "extinguished"],
    suggestedProcedure: [
      "Launch Connected fuel and run it for 100 ticks.",
      "Use the existing World Compare task to save its bounded run summary.",
      "Launch Firebreak corridor and run it for the same 100 ticks.",
      "Compare active fires, burned cells, extinction state, and visible landscape crossing."
    ],
    expectedPattern:
      "Watch for active-fire and burned-cell histories to separate when the connected run crosses the grid while the corridor run may stop at the full-height empty-cell path.",
    interpretationBoundary:
      "This abstract grid comparison is not wildfire prediction, suppression guidance, evacuation advice, risk assessment, or real-world safety evidence."
  }
];
