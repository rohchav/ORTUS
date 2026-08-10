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
      action: "Begin with Random Headings and give scattered boids time to encounter local neighbors.",
      demonstrates: "The baseline shows whether local steering can organize initially scattered headings into coordinated motion.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "alignmentWeight",
      targetLabel: "Alignment weight",
      action: "Lower Alignment weight to 0.20, rebuild, then replay the same seeded world.",
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
        sourceType: "conference-paper",
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
      action: "Follow the Infected agents output from the Random Outbreak start.",
      demonstrates: "The baseline shows how local stochastic contacts can accumulate into a population-level outbreak curve.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "infectionProbability",
      targetLabel: "Infection probability",
      action: "Reduce Infection probability to 0.10 and rebuild the fresh run for comparison.",
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
      action: "Watch the bounded opinion distribution evolve from Random Opinions.",
      demonstrates: "The baseline shows how repeated local averaging and noise reshape a bounded numeric opinion field.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "influenceStrength",
      targetLabel: "Influence strength",
      action: "Raise Influence strength to 0.35, rebuild, and compare how rapidly the distribution changes.",
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
      "How do Polarized Camps and Random Opinions starts differ under the same influence strength?",
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
      action: "Track both populations after Random Ecology seeds predators and prey across the field.",
      demonstrates: "The baseline reveals how encounter, energy, reproduction, and mortality rules can create lagged population change.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "predatorEnergyLoss",
      targetLabel: "Predator energy loss",
      action: "Increase Predator energy loss to 0.45 before rebuilding; compare how long predators persist.",
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
        sourceType: "historical-source",
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
      action: "Start from Random Neighborhood and watch vacancies redirect movement.",
      demonstrates: "The baseline shows how repeated local threshold checks can reshape a mixed grid.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "similarityThreshold",
      targetLabel: "Similarity threshold",
      action: "Move Similarity threshold up to 0.50, rebuild, and inspect movement and clustering.",
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
      action: "Ignite Random Forest and trace the active front through gaps in the fuel grid.",
      demonstrates: "The baseline shows how local adjacency and fuel fragmentation shape a propagation path.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "spreadProbability",
      targetLabel: "Spread probability",
      action: "Drop Spread probability to 0.25, rebuild, and trace the connected burn area.",
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
        description: "Use Dense Forest, Sparse Forest, Regrowing Forest, and Central Ignition starts with bounded model-output comparisons.",
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
      action: "Stimulate the Inhibition-Stabilized Cascade and watch activity move between network clusters.",
      demonstrates: "The baseline shows how delayed excitation, inhibition, decay, and refractory state shape bounded signal cascades.",
      recommendedTask: "setup"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "globalThreshold",
      targetLabel: "Global threshold",
      action: "Use Global threshold 1.40 in a rebuilt world, then compare cascade size and frequency.",
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
  },
  {
    id: "coordination-under-sensor-noise",
    version: "1",
    slug: "coordination-under-sensor-noise",
    title: "Coordination Under Sensor Noise",
    shortTitle: "Noisy Coordination",
    hookQuestion: "How does uncertain local sensing change coordination in a moving group?",
    oneSentencePremise: "The same moving agents organize from local steering while one bounded noise value changes between prepared runs.",
    summary:
      "This focused Collective Motion experience holds the seeded starting positions and steering rules steady while changing model noise. Comparing alignment, dispersion, and visible subgroup formation reveals how one local uncertainty term can reorganize aggregate motion.",
    runtimeStatus: "runnable",
    parentWorldId: "flocking",
    catalogOrder: 15,
    featured: false,
    domain: ["collective-behavior", "living-systems"],
    mechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    systemForms: ["spatial-agents"],
    complexity: "layered",
    estimatedFirstActivity: "About 8 minutes",
    visualKind: "coordination-noise",
    catalogIndicators: ["Controlled noise pair", "Local steering", "Same seeded start", "Alignment history"],
    runtime: {
      templateId: "flocking-boids",
      defaultScenarioId: "random-headings",
      supportedScenarioIds: ["random-headings"],
      recommendedTask: "observe",
      recommendedMetricId: "alignmentScore",
      recommendedParameterId: "noise"
    },
    anatomy: {
      entities: ["Boids with bounded position, velocity, and local steering state."],
      environment: ["A continuous two-dimensional field in which distance defines each local neighborhood."],
      boundaries: ["The same template-owned boundary rule is shared by both prepared recipes."],
      feedbackLoops: ["Motion changes neighborhoods, and later neighborhoods change steering."],
      stochasticity: ["One deterministic seed drives both starts while the bounded steering-noise value differs."],
      observables: ["Alignment and dispersion histories are model outputs; visible subgroups are qualitative run structure."]
    },
    primaryMechanisms: ["local-neighbor", "feedback", "stochastic-transition"],
    interactionPattern:
      "Each boid combines alignment, cohesion, and separation from nearby agents, then receives bounded seeded steering noise before movement.",
    systemDynamics:
      "The prepared pair changes only the noise value. Repeated local heading disagreement may delay one common direction, widen the flock, or leave several moving subgroups in this stylized model.",
    firstRun: {
      action: "Compare the Random Headings start while the model remains paused at tick 0.",
      demonstrates: "The starting field keeps local steering structure visible before the low-noise baseline begins.",
      recommendedTask: "observe"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "noise",
      targetLabel: "Noise",
      action: "Raise Noise to 0.28, rebuild, and compare alignment and dispersion under the same seed.",
      direction: "increase",
      suggestedValue: 0.28,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Watch whether common direction forms later or visible moving subgroups remain separated."
    },
    whatToWatch: [
      {
        label: "Alignment score",
        description: "Magnitude of the mean normalized heading vector, from 0 to 1. Higher values mean more similar model headings, not animal coordination or spatial cohesion.",
        metricId: "alignmentScore"
      },
      {
        label: "Dispersion",
        description: "Mean distance in world units from the flock's current center of mass. Higher values mean wider spread around that center, not necessarily fragmentation.",
        metricId: "dispersion"
      },
      {
        label: "Visible subgroup formation",
        description: "Inspect whether one coherent flock or several moving clusters remain visible without treating appearance as a new metric."
      }
    ],
    investigationPrompts: [
      "Does higher noise delay coordination for the full suggested horizon or only during early motion?",
      "Can similar final alignment histories hide different visible subgroup arrangements?",
      "How does replaying both prepared recipes clarify which differences belong to noise rather than the seed?"
    ],
    sources: [
      {
        sourceId: "coordination-vicsek-noise-1995",
        title: "Novel Type of Phase Transition in a System of Self-Driven Particles",
        authorsOrOrganization: "Tamas Vicsek, Andras Czirok, Eshel Ben-Jacob, Inon Cohen, and Ofer Shochet",
        year: 1995,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1103/PhysRevLett.75.1226",
        relationship: "research-context",
        note: "Provides research context for local alignment and noise; it does not validate ORTUS parameters, thresholds, or visual outcomes."
      }
    ],
    mainLimitation:
      "The agents have abstract perfect-radius neighborhoods plus a noise term; this is not animal-behavior validation, autonomous-vehicle safety evidence, or an optimized swarm controller.",
    remixIdeas: [
      {
        title: "Move the noise contrast",
        description: "Use current bounded parameters to compare other noise values while keeping the same template and seed explicit.",
        status: "runtime-now"
      },
      {
        title: "Record both bounded summaries",
        description: "Use the existing World Compare task to inspect the two run summaries without creating Lab evidence.",
        status: "advanced-tools"
      },
      {
        title: "Represent sensing errors explicitly",
        description: "Agent-specific occlusion, delay, or biased sensing would require future audited template behavior.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Heterogeneous sensing",
        description: "Give bounded agent groups distinct template-owned sensing contracts without introducing arbitrary controller code.",
        requiredCapability: "Audited heterogeneous perception and delay runtime"
      }
    ]
  },
  {
    id: "clustered-outbreak-starts",
    version: "1",
    slug: "clustered-outbreak-starts",
    title: "Clustered Outbreak Starts",
    shortTitle: "Outbreak Geometry",
    hookQuestion: "Do several local outbreak starts remain separate or merge into a broader model wave?",
    oneSentencePremise: "Equal infected counts begin in one cluster or several seeded hotspots while contact and recovery rules remain shared.",
    summary:
      "This focused Local Contact Outbreaks experience isolates initial spatial geometry. One prepared run concentrates nine infected model agents near the center; the other distributes the same count around three seeded hotspots before identical local transmission and recovery updates begin.",
    runtimeStatus: "runnable",
    parentWorldId: "epidemic",
    catalogOrder: 25,
    featured: false,
    domain: ["environment-and-spread", "population-dynamics"],
    mechanisms: ["spatial-contact", "contagion", "event-resolution", "stochastic-transition"],
    systemForms: ["spatial-agents", "population"],
    complexity: "layered",
    estimatedFirstActivity: "About 9 minutes",
    visualKind: "clustered-outbreaks",
    catalogIndicators: ["Matched infected count", "Spatial starting geometry", "Recovery delay", "Count histories"],
    runtime: {
      templateId: "epidemic-spread",
      defaultScenarioId: "single-cluster-outbreak",
      supportedScenarioIds: ["single-cluster-outbreak", "multiple-hotspots"],
      recommendedTask: "observe",
      recommendedMetricId: "infectedCount",
      recommendedParameterId: "infectionProbability"
    },
    anatomy: {
      entities: ["Moving susceptible, infected, and recovered model agents."],
      groups: ["Initial infected agents form either one spatial cluster or several seeded hotspots."],
      environment: ["A bounded continuous contact field shared by both recipes."],
      delays: ["The same scheduled recovery delay resolves infected state in each run."],
      stochasticity: ["One deterministic seed controls positions, movement, and contact trials across the pair."],
      observables: ["Infected and recovered model-agent counts plus visible spatial propagation paths."]
    },
    primaryMechanisms: ["spatial-contact", "contagion", "event-resolution", "stochastic-transition"],
    interactionPattern:
      "Infected agents transmit only through bounded nearby contact, and each infected agent receives the same template-owned scheduled recovery process.",
    systemDynamics:
      "Starting geometry changes which susceptible neighborhoods encounter infection first. Separate pockets may remain apart, fade, or visibly coalesce while aggregate count histories rise and fall.",
    firstRun: {
      action: "Inspect Single Cluster Outbreak with nine infected model agents concentrated near one center.",
      demonstrates: "The baseline establishes one spatial source before local contact and recovery events reshape the population counts.",
      recommendedTask: "observe"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "infectionProbability",
      targetLabel: "Infection probability",
      action: "Test Infection probability at 0.10 in a rebuilt cluster start and compare the infected history.",
      direction: "decrease",
      suggestedValue: 0.1,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for a changed peak Infected count, timing, or seeded fade-out without interpreting it as a forecast."
    },
    whatToWatch: [
      {
        label: "Infected count",
        description: "Follow current infected model agents and compare the highest visible history value rather than treating it as case data.",
        metricId: "infectedCount"
      },
      {
        label: "Recovered count",
        description: "Track model agents whose scheduled recovery event has resolved.",
        metricId: "recoveredCount"
      },
      {
        label: "Spatial coalescence",
        description: "Inspect whether separate infected pockets remain visible or merge through local contact paths."
      }
    ],
    investigationPrompts: [
      "Do separated hotspots produce an earlier or later peak Infected count under this seed?",
      "Can the two runs end with similar Recovered counts after visibly different propagation paths?",
      "At what part of the run do several local pockets become difficult to distinguish spatially?"
    ],
    sources: [
      {
        sourceId: "outbreak-keeling-spatial-1999",
        title: "The Effects of Local Spatial Structure on Epidemiological Invasions",
        authorsOrOrganization: "Matt J. Keeling",
        year: 1999,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1098/rspb.1999.0716",
        relationship: "research-context",
        note: "Connects spatial structure with epidemic invasion dynamics; it does not calibrate this stylized contact runtime or support forecasts."
      }
    ],
    mainLimitation:
      "This stylized homogeneous contact process has no disease-specific biology, behavior response, or empirical calibration and must not be used for forecasts, public-health guidance, or policy advice.",
    remixIdeas: [
      {
        title: "Change contact conditions",
        description: "Rebuild both supported starts with one shared infection radius, transmission chance, or recovery delay change.",
        status: "runtime-now"
      },
      {
        title: "Compare equal horizons",
        description: "Use the existing World Compare task to inspect bounded output summaries from the two explicit recipes.",
        status: "advanced-tools"
      },
      {
        title: "Add structured places",
        description: "Households, workplaces, schedules, and heterogeneous susceptibility require future audited template mechanics.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Typed contact settings",
        description: "Represent bounded place and schedule types without turning the model into public-health prediction.",
        requiredCapability: "Audited place, schedule, and heterogeneous-contact runtime"
      }
    ]
  },
  {
    id: "predator-pressure-recovery",
    version: "1",
    slug: "predator-pressure-and-recovery",
    title: "Predator Pressure and Recovery",
    shortTitle: "Predator Pressure",
    hookQuestion: "Which starting conditions let prey recover, sustain cycles, or collapse?",
    oneSentencePremise: "The same prey population and seeded field begin under low or high predator pressure without changing ecological mechanics.",
    summary:
      "This focused Predator-Prey Cycles experience changes only the starting predator count while holding prey count, seed, movement, encounter, energy-loss, and reproduction rules steady. The pair supports inspection of delayed count feedback, extinction states, and possible model-population recovery.",
    runtimeStatus: "runnable",
    parentWorldId: "predator-prey",
    catalogOrder: 45,
    featured: false,
    domain: ["population-dynamics", "living-systems"],
    mechanisms: ["predation", "resource-consumption", "feedback", "stochastic-transition"],
    systemForms: ["spatial-agents", "population"],
    complexity: "layered",
    estimatedFirstActivity: "About 10 minutes",
    visualKind: "predator-pressure",
    catalogIndicators: ["Starting-ratio pair", "Delayed feedback", "Population histories", "Extinction state"],
    runtime: {
      templateId: "predator-prey",
      defaultScenarioId: "random-ecology",
      supportedScenarioIds: ["random-ecology"],
      recommendedTask: "observe",
      recommendedMetricId: "preyCount",
      recommendedParameterId: "initialPredators"
    },
    anatomy: {
      entities: ["Moving prey and predator model agents."],
      groups: ["Prepared starts use the same prey count with two or twelve initial predators."],
      environment: ["A continuous seeded field with shared movement and encounter rules."],
      resources: ["Predator energy is a bounded template state gained through prey encounters and lost over time."],
      feedbackLoops: ["Predation changes prey availability, which changes later predator energy, reproduction, and death."],
      observables: ["Prey and predator model-agent counts, zero-count states, and the timing of visible cycles."]
    },
    primaryMechanisms: ["predation", "resource-consumption", "feedback", "stochastic-transition"],
    interactionPattern:
      "Predators consume nearby prey, gain and lose energy, reproduce above a fixed threshold, and die at depleted energy while prey reproduce stochastically.",
    systemDynamics:
      "A changed starting ratio alters early encounter pressure. Later prey availability feeds back into predator persistence, so count declines and recoveries may be delayed relative to the initial difference.",
    firstRun: {
      action: "Observe Random Ecology with a prey-heavy starting ratio before following both population histories.",
      demonstrates: "The shared seeded arrangement makes the starting population ratio explicit before local encounters begin.",
      recommendedTask: "observe"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "initialPredators",
      targetLabel: "Initial predators",
      action: "Set Initial predators to 12, rebuild, and compare prey persistence and predator depletion.",
      direction: "increase",
      suggestedValue: 12,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Look for earlier prey decline, a zero-count state, shifted cycle timing, or later model-population recovery."
    },
    whatToWatch: [
      {
        label: "Prey count",
        description: "Track living prey model agents and note any zero-count or later recovery state.",
        metricId: "preyCount"
      },
      {
        label: "Predator count",
        description: "Follow predator persistence as energy gain depends on remaining local prey encounters.",
        metricId: "predatorCount"
      },
      {
        label: "Cycle timing and extinction",
        description: "Compare count-history timing and visible absence without treating either as ecological evidence."
      }
    ],
    investigationPrompts: [
      "Does the high-pressure run reach a zero prey count before predators begin to decline?",
      "How long after the initial ratio difference do the two predator histories remain separated?",
      "Can a lower early prey count be followed by recovery under the unchanged reproduction and encounter rules?"
    ],
    sources: [
      {
        sourceId: "predator-volterra-1926-context",
        title: "Fluctuations in the Abundance of a Species Considered Mathematically",
        authorsOrOrganization: "Vito Volterra",
        year: 1926,
        sourceType: "historical-source",
        urlOrDoi: "https://doi.org/10.1038/118558a0",
        relationship: "historical-context",
        note: "Provides historical population-feedback context; ORTUS uses explicit moving agents and does not reproduce or calibrate Volterra's equations."
      }
    ],
    mainLimitation:
      "The model omits species biology, habitat, food webs, environmental variation, and empirical calibration; it is not a reproduction of a specific ecosystem, conservation forecast, or policy evidence.",
    remixIdeas: [
      {
        title: "Move the starting ratio",
        description: "Use bounded Initial prey and Initial predators values to form another explicit paired comparison.",
        status: "runtime-now"
      },
      {
        title: "Inspect bounded count summaries",
        description: "Use the existing World Compare task without expanding storage or creating persistent evidence.",
        status: "advanced-tools"
      },
      {
        title: "Add habitat and food-web structure",
        description: "Multiple species, explicit resources, and heterogeneous habitat need future audited runtime behavior.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Structured ecological interactions",
        description: "Add bounded species and habitat types while preserving clear model-risk language.",
        requiredCapability: "Audited multi-species and habitat runtime"
      }
    ]
  },
  {
    id: "patch-density-firebreaks",
    version: "1",
    slug: "patch-density-and-firebreaks",
    title: "Patch Density and Firebreaks",
    shortTitle: "Firebreak Paths",
    hookQuestion: "How does the arrangement of burnable cells decide whether spread crosses the landscape?",
    oneSentencePremise: "A connected fuel grid and a grid interrupted by one empty-cell corridor use the same local spread settings.",
    summary:
      "This focused Landscape Spread experience compares an uninterrupted fuel path with one deterministic full-height corridor made from the existing empty-cell state. Both starts share a central ignition, seed, local neighborhood, and spread settings; the corridor changes connectivity and removes one column from the initial fuel quantity.",
    runtimeStatus: "runnable",
    parentWorldId: "forest-spread",
    catalogOrder: 65,
    featured: false,
    domain: ["environment-and-spread", "living-systems"],
    mechanisms: ["local-neighbor", "contagion", "stochastic-transition"],
    systemForms: ["grid"],
    complexity: "layered",
    estimatedFirstActivity: "About 8 minutes",
    visualKind: "firebreak-corridor",
    catalogIndicators: ["Connected-path pair", "Actual empty corridor", "Local grid spread", "Burn histories"],
    runtime: {
      templateId: "forest-fire",
      defaultScenarioId: "central-ignition",
      supportedScenarioIds: ["central-ignition", "firebreak-corridor"],
      recommendedTask: "observe",
      recommendedMetricId: "activeFireCount",
      recommendedParameterId: "spreadProbability"
    },
    anatomy: {
      entities: ["Grid cells in existing empty, fuel, burning, or burned template states."],
      environment: ["A connected fuel layout or the same layout with one full-height empty-cell corridor."],
      boundaries: ["Closed grid boundaries keep the corridor connected to both outer edges."],
      feedbackLoops: ["Burning consumes connected fuel and changes which local paths remain available on later ticks."],
      stochasticity: ["The pair uses one deterministic seed while its selected spread probability removes uncertainty from local spread outcomes."],
      observables: ["Active fires, burned cells, extinction state, and visible crossing of the model grid."]
    },
    primaryMechanisms: ["local-neighbor", "contagion", "stochastic-transition"],
    interactionPattern:
      "Burning cells ignite only neighboring fuel cells through existing local grid rules; empty corridor cells cannot carry that state transition.",
    systemDynamics:
      "A connected layout offers a path across the field, while the full-height corridor interrupts adjacency without adding suppression, weather, terrain, or a new spread mechanic.",
    firstRun: {
      action: "Trace Central Ignition through the fully connected fuel grid from paused tick 0.",
      demonstrates: "The baseline exposes an uninterrupted local path before the contrast inserts an actual spatial corridor.",
      recommendedTask: "observe"
    },
    firstChange: {
      targetType: "parameter",
      targetId: "spreadProbability",
      targetLabel: "Spread probability",
      action: "Set Spread probability to 1.00, rebuild, and inspect connected landscape crossing.",
      direction: "increase",
      suggestedValue: 1,
      runSemantics: "rebuild-world",
      differenceToLookFor: "Watch the active front and final Burned cells while keeping the result inside the abstract grid model."
    },
    whatToWatch: [
      {
        label: "Active fires",
        description: "Follow currently burning model cells as the local front moves through available paths.",
        metricId: "activeFireCount"
      },
      {
        label: "Burned cells",
        description: "Compare burned model-cell extent after equal run horizons.",
        metricId: "burnedTotalCount"
      },
      {
        label: "Extinguished state",
        description: "Note when no model cells remain burning; this is not evidence about fire suppression.",
        metricId: "extinguished"
      },
      {
        label: "Landscape crossing",
        description: "Inspect whether the visible front reaches cells beyond the corridor without treating appearance as a field measurement."
      }
    ],
    investigationPrompts: [
      "At what tick does the connected front reach the far side of the model grid?",
      "How do active-fire histories differ even before final Burned cells separate?",
      "Does the corridor change extinction timing after it prevents access to the isolated fuel region?"
    ],
    sources: [
      {
        sourceId: "firebreak-drossel-schwabl-1992",
        title: "Self-Organized Critical Forest-Fire Model",
        authorsOrOrganization: "Barbara Drossel and Franz Schwabl",
        year: 1992,
        sourceType: "peer-reviewed-paper",
        urlOrDoi: "https://doi.org/10.1103/PhysRevLett.69.1629",
        relationship: "research-context",
        note: "Provides context for abstract grid fire models; ORTUS does not implement that paper's full model or claim criticality from this comparison."
      }
    ],
    mainLimitation:
      "This abstract grid is not a calibrated wildfire model and includes no weather, terrain, suppression, evacuation, risk assessment, or real-world safety guidance.",
    remixIdeas: [
      {
        title: "Change the corridor context",
        description: "Use current bounded fuel, spread, neighborhood, or burn-duration settings while keeping each comparison explicit.",
        status: "runtime-now"
      },
      {
        title: "Compare equal run horizons",
        description: "Use the existing World Compare task to inspect bounded cell-count summaries from both recipes.",
        status: "advanced-tools"
      },
      {
        title: "Add real environmental structure",
        description: "Weather, terrain, suppression, GIS data, and operational risk need separate validated systems and remain out of scope.",
        status: "future-capability"
      }
    ],
    futureExpansion: [
      {
        title: "Typed landscape structure",
        description: "Represent audited environmental factors without converting stylized output into wildfire guidance.",
        requiredCapability: "Validated environmental-field and provenance runtime"
      }
    ]
  }
] as const;
