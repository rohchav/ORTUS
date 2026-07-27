export const rawStarterWorldDefinitions = [
  {
    id: "flocking",
    version: "1",
    slug: "collective-motion",
    title: "Collective Motion",
    shortTitle: "Flocking",
    hookQuestion: "How can coordinated movement emerge without a leader?",
    oneSentencePremise: "Moving agents align, cohere, and avoid crowding by responding only to nearby neighbors.",
    summary:
      "Each boid steers from local information rather than a global plan. Repeated neighbor responses can pull scattered motion into a coordinated flock, split it into fragments, or keep it noisy and dispersed.",
    runtimeStatus: "runnable",
    catalogOrder: 10,
    featured: true,
    domain: ["collective-behavior", "living-systems"],
    mechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    systemForms: ["spatial-agents"],
    complexity: "quick-start",
    estimatedFirstActivity: "About 5 minutes",
    visualKind: "collective-motion",
    catalogIndicators: ["Local interaction", "Spatial agents", "Steering feedback", "Seeded noise"],
    runtime: {
      templateId: "flocking-boids",
      defaultScenarioId: "random-headings",
      supportedScenarioIds: ["random-headings", "aligned-flock", "two-opposing-flocks", "ring-formation"],
      recommendedTask: "setup",
      recommendedMetricId: "alignmentScore",
      recommendedParameterId: "alignmentWeight"
    },
    anatomy: {
      entities: ["Boids with position, velocity, and a bounded steering state."],
      groups: ["Optional initialized boid groups are used only by the template-owned group-aware mode."],
      environment: ["A continuous two-dimensional field where nearby positions define interaction neighborhoods."],
      boundaries: ["Wrap, bounce, or clamp edge handling is selected by the template parameter."],
      feedbackLoops: ["Steering changes motion, motion changes future neighborhoods, and those neighborhoods change later steering."],
      stochasticity: ["Seeded initial headings and bounded steering noise."],
      observables: ["Alignment, dispersion, speed, local density, and neighbor counts are model outputs."]
    },
    primaryMechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    interactionPattern:
      "At each tick, a boid senses nearby agents and combines alignment, cohesion, and separation steering before moving.",
    systemDynamics:
      "No agent receives a group destination or leader command. Collective direction is an aggregate pattern produced by repeated local updates, and it can weaken when alignment falls or noise rises.",
    firstRun: {
      action: "Run the random-headings baseline and let the agents find local neighbors.",
      demonstrates: "The baseline shows whether local steering can organize initially scattered headings into coordinated motion.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "alignmentWeight",
      targetLabel: "Alignment weight",
      action: "Set Alignment weight to 0.20, then rebuild and run the same seeded world.",
      direction: "decrease",
      suggestedValue: 0.2,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Compare how quickly common direction forms and whether the flock remains coherent or fragments."
    },
    whatToWatch: [
      {
        label: "Alignment score",
        description: "A model-output score for similarity in boid headings; it is not a measurement of animal coordination.",
        metricId: "alignmentScore"
      },
      {
        label: "Dispersion",
        description: "Watch the field for clustering, long streams, separated groups, and agents spreading apart.",
        metricId: "dispersion"
      }
    ],
    investigationPrompts: [
      "Does stronger separation preserve a coherent flock or break it into smaller groups?",
      "How does perception radius change the time needed for common direction to appear?",
      "Can the same seed produce visibly different organization after only one steering weight changes?"
    ],
    sources: [
      {
        sourceId: "flocking-reynolds-1987",
        title: "Flocks, Herds, and Schools: A Distributed Behavioral Model",
        authorsOrOrganization: "Craig W. Reynolds",
        year: 1987,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1145/37401.37406",
        relationship: "canonical-model",
        note: "Introduces the distributed local-behavior approach that inspired boids; ORTUS implements its own bounded template rules."
      },
      {
        sourceId: "flocking-vicsek-1995",
        title: "Novel Type of Phase Transition in a System of Self-Driven Particles",
        authorsOrOrganization: "Tamas Vicsek, Andras Czirok, Eshel Ben-Jacob, Inon Cohen, and Ofer Shochet",
        year: 1995,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1103/PhysRevLett.75.1226",
        relationship: "research-context",
        note: "Connects local alignment and noise to collective-motion regimes without validating this particular implementation."
      }
    ],
    mainLimitation:
      "The boids are abstract steering particles with no perception errors, goals, energy budgets, obstacles, or animal biology.",
    remixIdeas: [
      {
        title: "Change the steering balance",
        description: "Rebuild the runtime with different alignment, cohesion, separation, perception, or noise parameters.",
        status: "runtime-now"
      },
      {
        title: "Compare bounded sweeps",
        description: "Use the current Experiment Runner to compare final model outputs across a bounded parameter range.",
        status: "advanced-tools"
      },
      {
        title: "Add heterogeneous roles and obstacles",
        description: "Different agent roles, goals, and obstacle-aware sensing would require a future template or Builder runtime path.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Flocks across explicit scales",
        description: "Connect individual motion to explicit group and population scale levels with audited aggregation rules.",
        requiredCapability: "Runtime multiscale aggregation and cross-scale coupling"
      }
    ]
  },
  {
    id: "epidemic",
    version: "1",
    slug: "local-contact-outbreaks",
    title: "Local Contact Outbreaks",
    shortTitle: "Epidemic Spread",
    hookQuestion: "How can local contacts create a population-wide outbreak?",
    oneSentencePremise: "Moving agents transmit a stylized infection through nearby contact and recover after a fixed model delay.",
    summary:
      "A few infected agents move among susceptible agents in a bounded field. Seeded contact events and scheduled recovery turn many local encounters into changing susceptible, infected, and recovered counts.",
    runtimeStatus: "runnable",
    catalogOrder: 20,
    featured: false,
    domain: ["environment-and-spread", "population-dynamics"],
    mechanisms: ["spatial-contact", "contagion", "event-resolution", "stochastic-transition"],
    systemForms: ["spatial-agents", "population"],
    complexity: "layered",
    estimatedFirstActivity: "About 6 minutes",
    visualKind: "contact-spread",
    catalogIndicators: ["Local contact", "Moving agents", "Recovery delay", "Population counts"],
    runtime: {
      templateId: "epidemic-spread",
      defaultScenarioId: "random-outbreak",
      supportedScenarioIds: ["random-outbreak", "single-cluster-outbreak", "multiple-hotspots"],
      recommendedTask: "setup",
      recommendedMetricId: "infectedCount",
      recommendedParameterId: "infectionProbability"
    },
    anatomy: {
      entities: ["Moving susceptible, infected, and recovered agents."],
      environment: ["A continuous two-dimensional contact field."],
      boundaries: ["Agents remain inside the template's bounded movement field."],
      delays: ["Recovery events resolve after the configured number of simulation ticks."],
      feedbackLoops: ["More infected agents create more possible transmitting contacts until recovery removes infectious agents."],
      stochasticity: ["Transmission and starting positions use deterministic seeded random streams."],
      observables: ["Susceptible, infected, and recovered model-agent counts over simulated ticks."]
    },
    primaryMechanisms: ["spatial-contact", "contagion", "event-resolution", "stochastic-transition"],
    interactionPattern:
      "An infected agent can transmit to susceptible neighbors inside the infection radius, after which a scheduled event changes that agent to recovered.",
    systemDynamics:
      "The outbreak curve is assembled from many local contact trials and fixed recovery delays. The model can fade out early, spread broadly, or peak at different times under different supported parameters.",
    firstRun: {
      action: "Run the random-outbreak baseline and follow the infected model-agent count.",
      demonstrates: "The baseline shows how local stochastic contacts can accumulate into a population-level outbreak curve.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "infectionProbability",
      targetLabel: "Infection probability",
      action: "Set Infection probability to 0.10, rebuild the fresh run, and compare it with the baseline.",
      direction: "decrease",
      suggestedValue: 0.1,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for a lower or later infected-count peak, a shorter outbreak, or seeded fade-out."
    },
    whatToWatch: [
      {
        label: "Infected agents",
        description: "Track the model-agent count as it rises, peaks, and falls; it is not a case forecast.",
        metricId: "infectedCount"
      },
      {
        label: "Spatial contact pockets",
        description: "Watch whether infected agents remain isolated or encounter dense groups before recovery."
      }
    ],
    investigationPrompts: [
      "How does a wider contact radius change the outbreak peak under the same seed?",
      "Can faster recovery stop spread even when per-contact transmission remains high?",
      "How do one cluster and several hotspots differ before their population curves become similar?"
    ],
    sources: [
      {
        sourceId: "epidemic-kermack-mckendrick-1927",
        title: "A Contribution to the Mathematical Theory of Epidemics",
        authorsOrOrganization: "William O. Kermack and Anderson G. McKendrick",
        year: 1927,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1098/rspa.1927.0118",
        relationship: "historical-context",
        note: "Provides canonical compartmental epidemic context; ORTUS instead resolves explicit moving agents and local contact."
      },
      {
        sourceId: "epidemic-keeling-1999",
        title: "The Effects of Local Spatial Structure on Epidemiological Invasions",
        authorsOrOrganization: "Matt J. Keeling",
        year: 1999,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1098/rspb.1999.0716",
        relationship: "research-context",
        note: "Connects spatial structure with invasion dynamics; it does not calibrate ORTUS contact or recovery parameters."
      }
    ],
    mainLimitation:
      "This is a stylized contact process with no age, immunity variation, disease-specific biology, behavior response, or empirical calibration.",
    remixIdeas: [
      {
        title: "Move the contact and recovery levers",
        description: "Change contact radius, transmission chance, recovery ticks, or movement speed and rebuild the run.",
        status: "runtime-now"
      },
      {
        title: "Compare starting geometries",
        description: "Use the existing starting recipes and bounded comparison tools to contrast a cluster with multiple hotspots.",
        status: "advanced-tools"
      },
      {
        title: "Add heterogeneous contact settings",
        description: "Households, workplaces, mobility schedules, and varying susceptibility require new audited template behavior.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Couple agents to institutions and places",
        description: "Represent explicit place types and population groups without turning outputs into public-health forecasts.",
        requiredCapability: "Typed places, schedules, and bounded heterogeneous agent state"
      }
    ]
  },
  {
    id: "opinion-dynamics",
    version: "1",
    slug: "opinion-formation",
    title: "Opinion Formation",
    shortTitle: "Opinion Dynamics",
    hookQuestion: "When do interacting opinions converge, fragment, or polarize?",
    oneSentencePremise: "Agents adjust bounded numeric opinions through nearby influence, seeded noise, and optional stylized source exposure.",
    summary:
      "Agents carry scalar model opinions between -1 and 1 and respond to nearby neighbors. The optional social-learning mode adds bounded numeric source, crowd, trust, and memory terms without simulating minds or real beliefs.",
    runtimeStatus: "runnable",
    catalogOrder: 30,
    featured: false,
    domain: ["information-and-society", "collective-behavior"],
    mechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    systemForms: ["spatial-agents"],
    complexity: "layered",
    estimatedFirstActivity: "About 7 minutes",
    visualKind: "opinion-field",
    catalogIndicators: ["Bounded opinions", "Nearby influence", "Seeded noise", "Aggregate disagreement"],
    runtime: {
      templateId: "opinion-dynamics",
      defaultScenarioId: "random-opinions",
      supportedScenarioIds: ["random-opinions", "polarized-camps", "consensus-start"],
      recommendedTask: "setup",
      recommendedMetricId: "polarizationScore",
      recommendedParameterId: "influenceStrength"
    },
    anatomy: {
      entities: ["Mobile agents with a bounded scalar opinion and stubbornness."],
      environment: ["A continuous field where distance determines the current influence neighborhood."],
      networks: ["Transient radius-based neighbor relations; the template does not create a persistent social network."],
      delays: ["The social-learning mode retains bounded scalar memory with configured decay."],
      adaptation: ["Optional template-owned numeric source and memory updates; these are not cognition or human learning."],
      stochasticity: ["Seeded initial opinions, positions, and bounded opinion noise."],
      observables: ["Average opinion, variance, polarization, and bounded influence summaries are model outputs."]
    },
    primaryMechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    interactionPattern:
      "Agents sense nearby scalar opinions and move partway toward a local target, with optional bounded source, crowd, trust, and memory contributions in the social-learning mode.",
    systemDynamics:
      "Repeated influence can reduce disagreement, preserve separated clusters, or shift the population depending on starting conditions and supported parameters. The values describe the model, not people.",
    firstRun: {
      action: "Run the random-opinions baseline and follow the distribution of model opinion values.",
      demonstrates: "The baseline shows how repeated local averaging and noise reshape a bounded numeric opinion field.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "influenceStrength",
      targetLabel: "Influence strength",
      action: "Set Influence strength to 0.35, rebuild, and compare how rapidly the distribution changes.",
      direction: "increase",
      suggestedValue: 0.35,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Watch whether clusters converge faster, remain divided, or fluctuate under the same seeded noise."
    },
    whatToWatch: [
      {
        label: "Polarization score",
        description: "A stylized model-output summary of separation around the neutral point, not measured public opinion.",
        metricId: "polarizationScore"
      },
      {
        label: "Opinion variance",
        description: "Compare the spread of numeric agent states as local influence accumulates.",
        metricId: "opinionVariance"
      }
    ],
    investigationPrompts: [
      "Does a larger influence radius produce one cluster or simply accelerate local movement?",
      "How do polarized-camps and random-opinions starts differ under the same influence strength?",
      "When does noise preserve variation that local averaging would otherwise reduce?"
    ],
    sources: [
      {
        sourceId: "opinion-deffuant-2000",
        title: "Mixing Beliefs Among Interacting Agents",
        authorsOrOrganization: "Guillaume Deffuant, David Neau, Frederic Amblard, and Gerard Weisbuch",
        year: 2000,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1142/S0219525900000078",
        relationship: "research-context",
        note: "Provides bounded-confidence context for continuous opinion models; ORTUS uses its own spatial-neighbor influence rule rather than that paper's confidence threshold."
      },
      {
        sourceId: "opinion-castellano-2009",
        title: "Statistical Physics of Social Dynamics",
        authorsOrOrganization: "Claudio Castellano, Santo Fortunato, and Vittorio Loreto",
        year: 2009,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1103/RevModPhys.81.591",
        relationship: "research-context",
        note: "Reviews families of formal social-dynamics models and their limits; it does not make ORTUS output evidence about real people."
      }
    ],
    mainLimitation:
      "Scalar opinions and source weights omit identity, language, institutions, meaning, and psychology, so they cannot profile or predict real people.",
    remixIdeas: [
      {
        title: "Change influence and noise",
        description: "Rebuild with supported radius, strength, noise, or initial-polarization parameters.",
        status: "runtime-now"
      },
      {
        title: "Inspect the stylized social-learning mode",
        description: "Use current scenario tools to select the template-owned mode and its bounded numeric source settings.",
        status: "advanced-tools"
      },
      {
        title: "Add explicit institutions or multilayer networks",
        description: "Persistent organizations, platform layers, and typed relationships require future audited primitives.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Model information across explicit layers",
        description: "Separate interpersonal, institutional, and platform interactions while preserving strict anti-profiling boundaries.",
        requiredCapability: "Multilayer network runtime with bounded symbolic state"
      }
    ]
  },
  {
    id: "predator-prey",
    version: "1",
    slug: "predator-prey-cycles",
    title: "Predator-Prey Cycles",
    shortTitle: "Predator-Prey",
    hookQuestion: "Why can two interacting populations rise, fall, and cycle?",
    oneSentencePremise: "Moving predators consume nearby prey, lose energy, reproduce above a threshold, and die when energy is exhausted.",
    summary:
      "Predators and prey share a continuous field but follow different rules. Encounters transfer model energy, prey reproduce stochastically, and predator survival feeds back into both population counts.",
    runtimeStatus: "runnable",
    catalogOrder: 40,
    featured: false,
    domain: ["population-dynamics", "living-systems"],
    mechanisms: ["resource-consumption", "predation", "feedback", "stochastic-transition"],
    systemForms: ["spatial-agents", "population"],
    complexity: "layered",
    estimatedFirstActivity: "About 7 minutes",
    visualKind: "population-cycle",
    catalogIndicators: ["Two populations", "Local encounters", "Energy budget", "Population feedback"],
    runtime: {
      templateId: "predator-prey",
      defaultScenarioId: "random-ecology",
      supportedScenarioIds: ["random-ecology", "prey-cluster-predator-edge", "sparse-predators"],
      recommendedTask: "setup",
      recommendedMetricId: "preyCount",
      recommendedParameterId: "predatorEnergyLoss"
    },
    anatomy: {
      entities: ["Moving prey agents and predators with bounded model energy."],
      environment: ["A continuous two-dimensional encounter field."],
      resources: ["Prey act as a consumable energy source for predators; there is no separate vegetation stock."],
      boundaries: ["Agents bounce within the template's fixed field."],
      feedbackLoops: ["Predation reduces prey, prey availability affects predator energy, and predator abundance changes future predation pressure."],
      selection: ["Predators reproduce only above the configured energy threshold and die at zero energy."],
      stochasticity: ["Seeded movement and prey reproduction trials."],
      observables: ["Living prey and predator model-agent counts."]
    },
    primaryMechanisms: ["resource-consumption", "predation", "feedback", "stochastic-transition"],
    interactionPattern:
      "Predators move, consume at most one nearby prey per tick, gain energy from that encounter, lose energy over time, and may reproduce before low-energy death.",
    systemDynamics:
      "Prey growth can support more predators; increased predation can then reduce prey and leave predators without enough energy. The resulting counts may cycle, collapse, or stabilize only within this stylized rule set.",
    firstRun: {
      action: "Run the random-ecology baseline and follow both population counts.",
      demonstrates: "The baseline reveals how encounter, energy, reproduction, and mortality rules can create lagged population change.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "predatorEnergyLoss",
      targetLabel: "Predator energy loss",
      action: "Set Predator energy loss to 0.45, rebuild, and compare predator persistence with the baseline.",
      direction: "increase",
      suggestedValue: 0.45,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for earlier predator decline, changed prey recovery, or extinction inside the model."
    },
    whatToWatch: [
      {
        label: "Prey count",
        description: "Watch prey decline and recovery relative to changes in predator abundance.",
        metricId: "preyCount"
      },
      {
        label: "Predator count",
        description: "Look for delayed peaks, decline after prey scarcity, and model extinction.",
        metricId: "predatorCount"
      }
    ],
    investigationPrompts: [
      "How does a prey-heavy start change the timing of the first predator peak?",
      "Can faster prey reproduction rescue both populations or destabilize their cycle?",
      "What changes when predators must get closer before consuming prey?"
    ],
    sources: [
      {
        sourceId: "predator-volterra-1926",
        title: "Fluctuations in the Abundance of a Species Considered Mathematically",
        authorsOrOrganization: "Vito Volterra",
        year: 1926,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1038/118558a0",
        relationship: "historical-context",
        note: "Provides canonical mathematical context for interacting population fluctuations; ORTUS is a spatial agent model and does not reproduce the Lotka-Volterra equations."
      }
    ],
    mainLimitation:
      "The ecology has two homogeneous species, no vegetation, habitat quality, age structure, carrying capacity, or empirical species parameters.",
    remixIdeas: [
      {
        title: "Change survival and reproduction",
        description: "Rebuild with supported energy, predation, movement, and reproduction parameters.",
        status: "runtime-now"
      },
      {
        title: "Compare starting arrangements",
        description: "Use existing recipes and bounded run summaries to compare random, clustered, and prey-heavy starts.",
        status: "advanced-tools"
      },
      {
        title: "Add habitat and food-web structure",
        description: "Spatial resources, more species, and typed trophic links require future runtime support.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Build a resource-coupled food web",
        description: "Connect spatial resources to several producer and consumer populations with explicit quantity semantics.",
        requiredCapability: "Runtime resource stocks, typed trophic networks, and quantity semantics"
      }
    ]
  },
  {
    id: "schelling",
    version: "1",
    slug: "neighborhood-patterns",
    title: "Neighborhood Patterns",
    shortTitle: "Schelling Segregation",
    hookQuestion: "How can local preferences create large-scale spatial separation?",
    oneSentencePremise: "Grid agents compare nearby occupied cells with a similarity threshold and some dissatisfied agents move to vacancies.",
    summary:
      "Two abstract groups begin in a mixed grid. Local satisfaction checks and moves into empty cells can reorganize that grid into visible clusters even though no agent receives a city-wide pattern target.",
    runtimeStatus: "runnable",
    catalogOrder: 50,
    featured: false,
    domain: ["information-and-society", "collective-behavior"],
    mechanisms: ["local-neighbor", "threshold", "stochastic-transition"],
    systemForms: ["grid"],
    complexity: "quick-start",
    estimatedFirstActivity: "About 5 minutes",
    visualKind: "neighborhood-grid",
    catalogIndicators: ["Grid agents", "Local threshold", "Vacancies", "Spatial pattern"],
    runtime: {
      templateId: "schelling-segregation",
      defaultScenarioId: "random-neighborhood",
      supportedScenarioIds: ["random-neighborhood", "clustered-neighborhood", "balanced-sparse-neighborhood"],
      recommendedTask: "setup",
      recommendedMetricId: "satisfactionRate",
      recommendedParameterId: "similarityThreshold"
    },
    anatomy: {
      entities: ["Abstract Group A and Group B agents occupying grid cells."],
      groups: ["Two model labels with no encoded demographic or protected-class meaning."],
      environment: ["A rectangular grid containing occupied and empty cells."],
      boundaries: ["Neighborhoods stop at the template's grid edges."],
      feedbackLoops: ["Moves change local composition, which changes later satisfaction and movement decisions."],
      selection: ["Only a seeded bounded fraction of currently dissatisfied agents moves each tick."],
      stochasticity: ["Seeded placement, group assignment, and movement order."],
      observables: ["Satisfaction, average similarity, movement, and vacancy counts are model outputs."]
    },
    primaryMechanisms: ["local-neighbor", "threshold", "stochastic-transition"],
    interactionPattern:
      "Each occupied cell evaluates nearby occupied neighbors against a similarity threshold; a bounded subset of dissatisfied agents moves to empty cells.",
    systemDynamics:
      "One move changes several neighborhoods at once, so local choices can reinforce or disrupt larger spatial clusters. Aggregate patterns do not reveal the motives or identities of real people.",
    firstRun: {
      action: "Run the random-neighborhood baseline and watch vacancies and clusters reorganize.",
      demonstrates: "The baseline shows how repeated local threshold checks can reshape a mixed grid.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "similarityThreshold",
      targetLabel: "Similarity threshold",
      action: "Set Similarity threshold to 0.50, rebuild, and compare movement and clustering.",
      direction: "increase",
      suggestedValue: 0.5,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Watch whether more agents become dissatisfied, movement lasts longer, and large same-label regions become more pronounced."
    },
    whatToWatch: [
      {
        label: "Satisfaction rate",
        description: "The fraction of model agents meeting the local threshold at the current tick.",
        metricId: "satisfactionRate"
      },
      {
        label: "Average similarity",
        description: "Compare the local same-label share with the visible grid pattern.",
        metricId: "averageSimilarity"
      }
    ],
    investigationPrompts: [
      "How does more empty space change agents' ability to move and the final grid pattern?",
      "Does a larger neighborhood radius smooth local variation or strengthen broad clusters?",
      "Can different thresholds reach similar satisfaction rates through visibly different arrangements?"
    ],
    sources: [
      {
        sourceId: "schelling-dynamic-models-1971",
        title: "Dynamic Models of Segregation",
        authorsOrOrganization: "Thomas C. Schelling",
        year: 1971,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1080/0022250X.1971.9989794",
        relationship: "canonical-model",
        note: "Introduces local-choice models of spatial patterning and warns that aggregate patterns do not establish individual motives."
      }
    ],
    mainLimitation:
      "Two abstract labels, one local threshold, and vacancy moves cannot explain the institutions, history, power, discrimination, or economics of real segregation.",
    remixIdeas: [
      {
        title: "Change density and local tolerance",
        description: "Rebuild with supported density, group ratio, neighborhood, threshold, and movement parameters.",
        status: "runtime-now"
      },
      {
        title: "Compare sparse and clustered starts",
        description: "Use current recipes and bounded run comparisons without assigning real-world identity to group labels.",
        status: "advanced-tools"
      },
      {
        title: "Add institutions and unequal constraints",
        description: "Housing costs, discriminatory rules, movement barriers, and more groups require a dedicated future model and ethical review.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Connect households, neighborhoods, and institutions",
        description: "Represent explicit scales and constraints without inferring protected attributes or motives.",
        requiredCapability: "Audited multiscale social model with typed institutions and ethical review"
      }
    ]
  },
  {
    id: "forest-spread",
    version: "1",
    slug: "landscape-spread",
    title: "Landscape Spread",
    shortTitle: "Forest Fire",
    hookQuestion: "When does local spread die out, and when does it cross the landscape?",
    oneSentencePremise: "Fuel, burning, burned, and empty grid cells change through local ignition, burn duration, lightning, and optional regrowth.",
    summary:
      "A seeded fuel landscape turns cell-scale adjacency into fire fronts, breaks, extinction, and recurring ignition. Density and spread probability shape whether burning remains local or crosses connected fuel.",
    runtimeStatus: "runnable",
    catalogOrder: 60,
    featured: false,
    domain: ["environment-and-spread", "living-systems"],
    mechanisms: ["contagion", "feedback", "event-resolution", "stochastic-transition"],
    systemForms: ["grid"],
    complexity: "layered",
    estimatedFirstActivity: "About 6 minutes",
    visualKind: "landscape-spread",
    catalogIndicators: ["Fuel grid", "Local propagation", "Fragmentation", "Regrowth"],
    runtime: {
      templateId: "forest-fire",
      defaultScenarioId: "random-forest",
      supportedScenarioIds: [
        "random-forest",
        "dense-dry-landscape",
        "sparse-fragmented-landscape",
        "regrowing-landscape",
        "central-ignition"
      ],
      recommendedTask: "setup",
      recommendedMetricId: "activeFireCount",
      recommendedParameterId: "spreadProbability"
    },
    anatomy: {
      entities: ["Grid cells in empty, fuel, burning, or burned model states."],
      environment: ["A rectangular two-dimensional fuel landscape."],
      resources: ["Fuel occupancy is a bounded cell state; it is not biomass or measured fuel load."],
      boundaries: ["Closed or wrapped edge handling is selected by the template parameter, not a full boundary model."],
      feedbackLoops: ["Burning removes fuel while optional regrowth can restore fuel to empty or burned cells."],
      delays: ["Burn duration controls how many ticks a cell remains burning before becoming burned."],
      stochasticity: ["Seeded local spread, lightning, initial fuel placement, and regrowth trials."],
      observables: ["Fuel, burning, burned, ignition, spread-rate, and extinction model outputs."]
    },
    primaryMechanisms: ["contagion", "event-resolution", "stochastic-transition"],
    interactionPattern:
      "Burning cells attempt to ignite adjacent fuel from the start-of-tick grid, then burning ages and optional regrowth resolves without overriding new ignitions.",
    systemDynamics:
      "Connected fuel can carry a front across the grid while gaps interrupt it. Stochastic ignition and optional regrowth can create repeated episodes, but the runtime does not model weather or physical fire behavior.",
    firstRun: {
      action: "Run the random-forest baseline and follow the active burning cells.",
      demonstrates: "The baseline shows how local adjacency and fuel fragmentation shape a propagation path.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "spreadProbability",
      targetLabel: "Spread probability",
      action: "Set Spread probability to 0.25, rebuild, and compare the connected burn area.",
      direction: "decrease",
      suggestedValue: 0.25,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for shorter fronts, more unburned fuel pockets, and earlier model extinction."
    },
    whatToWatch: [
      {
        label: "Active fires",
        description: "Count the cells currently burning as fronts grow or extinguish.",
        metricId: "activeFireCount"
      },
      {
        label: "Burned fraction",
        description: "Compare how much of the abstract fuel grid has entered the burned state.",
        metricId: "burnedFraction"
      }
    ],
    investigationPrompts: [
      "At what fuel density do gaps begin to interrupt most spreading fronts?",
      "How does an eight-neighbor rule change propagation compared with four neighbors?",
      "When can regrowth support recurring activity rather than one burn-and-stop episode?"
    ],
    sources: [
      {
        sourceId: "forest-drossel-schwabl-1992",
        title: "Self-Organized Critical Forest-Fire Model",
        authorsOrOrganization: "Barbara Drossel and Franz Schwabl",
        year: 1992,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1103/PhysRevLett.69.1629",
        relationship: "mechanism-inspiration",
        note: "Connects lightning, growth, and local burning in an abstract cellular model; ORTUS does not claim its scaling results or critical regime."
      }
    ],
    mainLimitation:
      "The grid omits wind, slope, moisture, heat transfer, suppression, fuel species, and calibration, so it is not a wildfire forecast.",
    remixIdeas: [
      {
        title: "Change connectivity and fuel",
        description: "Rebuild with supported fuel density, spread, lightning, regrowth, neighbor, boundary, and burn-duration controls.",
        status: "runtime-now"
      },
      {
        title: "Compare landscape recipes",
        description: "Use dense, sparse, regrowing, and central-ignition starts with bounded model-output comparisons.",
        status: "advanced-tools"
      },
      {
        title: "Add weather and terrain fields",
        description: "Directional wind, moisture, slope, and physical spread require audited spatial-field runtime behavior.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Couple local spread to environmental fields",
        description: "Sample typed wind, moisture, and terrain fields without treating synthetic outputs as observed wildfire evidence.",
        requiredCapability: "Runtime spatial fields, units, and validated field coupling"
      }
    ]
  },
  {
    id: "neural-excitation",
    version: "1",
    slug: "signal-cascades",
    title: "Signal Cascades",
    shortTitle: "Neural Excitation Network",
    hookQuestion: "How do signals propagate, compete, and form readouts in a network?",
    oneSentencePremise: "Abstract nodes integrate delayed excitatory and inhibitory influence, cross thresholds, enter refractory states, and can feed labeled output assemblies.",
    summary:
      "A bounded directed network carries stylized activation through weighted excitatory and inhibitory edges. Thresholds, delays, decay, refractory periods, and external stimuli shape cascades and designed model readouts.",
    runtimeStatus: "runnable",
    catalogOrder: 70,
    featured: false,
    domain: ["networks-and-signals"],
    mechanisms: ["signal-propagation", "network-influence", "threshold", "event-resolution", "adaptation"],
    systemForms: ["network"],
    complexity: "advanced",
    estimatedFirstActivity: "About 8 minutes",
    visualKind: "signal-network",
    catalogIndicators: ["Directed network", "Excitation and inhibition", "Signal delay", "Bounded readout"],
    runtime: {
      templateId: "neural-excitation-network",
      defaultScenarioId: "inhibition-stabilized-cascade",
      supportedScenarioIds: [
        "inhibition-stabilized-cascade",
        "quiet-network",
        "cascade-prone-network",
        "oscillating-network",
        "fragmented-network",
        "rock-paper-scissors-readout"
      ],
      recommendedTask: "setup",
      recommendedMetricId: "cascadeSize",
      recommendedParameterId: "globalThreshold"
    },
    anatomy: {
      entities: ["Abstract neuron-labeled nodes with bounded activation, threshold, and refractory state."],
      groups: ["Generated clusters and optional designer-labeled output assemblies."],
      environment: ["A template-owned directed graph; it is separate from Builder graphs and generic network artifacts."],
      networks: ["Bounded weighted excitatory and inhibitory connections generated by the selected topology."],
      delays: ["Signals travel through a capped queue for a configured number of simulation ticks."],
      feedbackLoops: ["Recurrent paths can amplify or suppress later activation while refractory state limits immediate refiring."],
      adaptation: ["Optional Neural Runtime Lab game-state adaptation is local, bounded, resettable, and does not change synapse weights."],
      stochasticity: ["Seeded graph generation, thresholds, noise, and external stimulus events."],
      observables: ["Cascade size, firing fraction, activation, synchrony, saturation, and designed readout values."]
    },
    primaryMechanisms: ["signal-propagation", "threshold", "event-resolution", "network-influence"],
    interactionPattern:
      "Nodes integrate delayed weighted input, fire after crossing a threshold, emit bounded signals, and remain refractory before returning to rest.",
    systemDynamics:
      "Connection structure and excitation-inhibition balance can keep activity quiet, support intermittent cascades, fragment it into modules, or approach the runtime saturation guard. Readout labels are assigned by the model designer.",
    firstRun: {
      action: "Run the inhibition-stabilized baseline and watch activity move between network clusters.",
      demonstrates: "The baseline shows how delayed excitation, inhibition, decay, and refractory state shape bounded signal cascades.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "globalThreshold",
      targetLabel: "Global threshold",
      action: "Set Global threshold to 1.40, rebuild, and compare the size and frequency of cascades.",
      direction: "increase",
      suggestedValue: 1.4,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for fewer firing nodes, smaller cascades, or activity that dies out between external stimuli."
    },
    whatToWatch: [
      {
        label: "Cascade size",
        description: "Recent firing events in a bounded model-output interval, not an empirical neural recording.",
        metricId: "cascadeSize"
      },
      {
        label: "Firing rate",
        description: "The fraction of abstract nodes firing this tick; activation is not membrane voltage.",
        metricId: "firingRate"
      }
    ],
    investigationPrompts: [
      "How does stronger inhibition change cascade persistence under the same generated graph?",
      "What combinations of threshold and decay separate quiet from cascade-prone behavior?",
      "How do longer signal delays change burst timing without changing the graph topology?",
      "When do labeled output assemblies produce a stable readout, an undecided state, or conflict?"
    ],
    sources: [
      {
        sourceId: "neural-gerstner-2014",
        title: "Neuronal Dynamics: From Single Neurons to Networks and Models of Cognition",
        authorsOrOrganization: "Wulfram Gerstner, Werner M. Kistler, Richard Naud, and Liam Paninski",
        year: 2014,
        sourceType: "book",
        urlOrDoi: "https://neuronaldynamics.epfl.ch/online/index.html",
        relationship: "educational-context",
        note: "Provides formal context for threshold, refractory, synaptic, and network models while also documenting their abstractions and limitations."
      },
      {
        sourceId: "neural-brunel-2000",
        title: "Dynamics of Sparsely Connected Networks of Excitatory and Inhibitory Spiking Neurons",
        authorsOrOrganization: "Nicolas Brunel",
        year: 2000,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1023/A:1008925309027",
        relationship: "research-context",
        note: "Connects excitation-inhibition balance with network activity regimes; ORTUS does not implement Brunel's biological equations or empirical interpretation."
      }
    ],
    mainLimitation:
      "This is a stylized signal network, not a biological brain simulation; its activation, edges, and readouts are designed model variables rather than neuroscience evidence.",
    remixIdeas: [
      {
        title: "Change cascade conditions",
        description: "Rebuild with supported topology, density, excitation, threshold, delay, decay, noise, and stimulus parameters.",
        status: "runtime-now"
      },
      {
        title: "Inspect bounded readouts and adaptation",
        description: "Use existing starting recipes and the Neural Runtime Lab for designer-labeled readouts and resettable local game-state adaptation.",
        status: "advanced-tools"
      },
      {
        title: "Design arbitrary network programs",
        description: "User-authored graph execution, learned synapses, and generic adaptive controllers require future audited runtime work.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Build reusable signal-processing networks",
        description: "Compose typed input, recurrent, and output assemblies without turning Builder edges into executable dataflow.",
        requiredCapability: "Dedicated bounded network authoring and interpreter contract"
      }
    ]
  }
] as const;
