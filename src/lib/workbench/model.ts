import type { ParameterDefinition, SimulationTemplate } from "../../simulation/kernel/types";
import type { AuthoredScenario } from "../../simulation/scenarios/scenarioTypes";
import { findInitializationPreset, initializationPresetsForTemplate } from "../../simulation/scenarios/scenarioPresets";
import { agentCompositionDefinitionsForTemplate, environmentOptionDefinitionsForTemplate } from "../../simulation/scenarios/scenarioVariantTypes";
import { getProductionTemplate } from "../../simulation/templates/registry";
import type { StarterWorldDefinition } from "../starterWorlds/types";
import { workbenchMaterials } from "./materials";
import type {
  WorkbenchControlGroup, WorkbenchControlReference, WorkbenchModel, WorkbenchPiece, WorkbenchPieceKind,
  WorkbenchRelationship
} from "./types";

type PieceOptions = Partial<Pick<WorkbenchPiece, "motif" | "reads" | "affects" | "fixed" | "capabilityReason">> & {
  parameters?: string[];
  initialization?: string[];
};

/**
 * A pure, bounded explanation of an existing template. Piece keys reference
 * authoritative controls; there are no parameter values, ranges, executable
 * rules, ports, engine objects, snapshots, or runtime dispatch in this model.
 */
export function deriveWorkbenchModel(world: StarterWorldDefinition): WorkbenchModel {
  const template = world.runtime ? getProductionTemplate(world.runtime.templateId) : undefined;
  if (!template || world.runtimeStatus !== "runnable") {
    return {
      templateId: world.runtime?.templateId ?? "", templateName: "No executable template", starterId: world.id,
      title: world.title, summary: world.oneSentencePremise, visualKind: world.visualKind,
      rootIds: ["reference"], pieces: [{
        id: "reference", label: world.shortTitle, description: world.summary, kind: "group", motif: "composition",
        capability: "reference", capabilityReason: "This Starter has no approved executable template.",
        controls: [], materialIds: [], reads: [], affects: [], fixed: world.mainLimitation
      }], relationships: []
    };
  }

  const pieces: WorkbenchPiece[] = [];
  const relationships: WorkbenchRelationship[] = [];
  const parameterOwners = new Map<string, WorkbenchPiece>();
  const initializationOwners = new Map<string, WorkbenchPiece>();
  const parameterKeys = new Set(template.parameterDefinitions.map((definition) => definition.key));
  const optionKeys = new Set(initializationPresetsForTemplate(template).flatMap((preset) => (preset.optionDefinitions ?? []).map((definition) => definition.key)));
  const bindOwner = (owners: Map<string, WorkbenchPiece>, keys: readonly string[], available: ReadonlySet<string>, piece: WorkbenchPiece) => {
    for (const key of keys) {
      if (!available.has(key) || owners.has(key)) {
        throw new Error(`Workbench ${template.id}: unknown or duplicate control owner for ${piece.id}.${key}`);
      }
      owners.set(key, piece);
    }
  };
  const add = (id: string, parentId: string | undefined, label: string, kind: WorkbenchPieceKind,
    description: string, materialIds: string[], options: PieceOptions = {}) => {
    const piece: WorkbenchPiece = {
      id, ...(parentId ? { parentId } : {}), label, kind, description,
      motif: options.motif ?? workbenchMaterials.find((material) => material.id === materialIds[0])?.motif ?? kind, capability: "executable",
      capabilityReason: options.capabilityReason ?? "Describes existing template-owned runtime behavior. This Workbench piece is explanatory and does not execute.",
      controls: [], materialIds: [...materialIds], reads: options.reads ?? [], affects: options.affects ?? [],
      fixed: options.fixed ?? "Rules and state shape belong to the template. This piece cannot be rewired or replaced with arbitrary behavior."
    };
    pieces.push(piece);
    bindOwner(parameterOwners, options.parameters ?? [], parameterKeys, piece);
    bindOwner(initializationOwners, options.initialization ?? [], optionKeys, piece);
    return piece;
  };
  const relate = (from: string, to: string, label: string, description: string) => {
    relationships.push({ id: `${from}:${to}:${relationships.length}`, from, to, label, description });
  };

  const populationLabel = template.id === "forest-fire" ? "Landscape cells"
    : template.id === "neural-excitation-network" ? "Excitable nodes" : "Population";
  const population = add("population", undefined, populationLabel, "population", world.anatomy.entities?.join(" ") ?? template.description,
    [template.id === "forest-fire" ? "grid" : "agents"]);
  add("initialization", "population", "Starting arrangement", "state",
    "An existing initialization recipe places the model's pieces before a fresh run. Selecting a recipe does not run this drawing.", [], { motif: "arrangement" });
  const dynamics = add("dynamics", undefined,
    template.id === "flocking-boids" ? "Local steering" : template.id === "predator-prey" ? "Ecological encounters"
      : template.id === "epidemic-spread" ? "Contact & recovery" : template.id === "forest-fire" ? "Local spread"
        : template.id === "neural-excitation-network" ? "Signal propagation" : "Local responses",
    "group", world.interactionPattern, [], { motif: "interaction" });
  const environment = add("environment", undefined, template.spaceDefinition?.type === "grid2d" ? "Discrete space"
    : template.id === "neural-excitation-network" ? "Connection topology" : "Shared space", "space",
  world.anatomy.environment?.join(" ") ?? "The template's declared space supplies its interaction context.", [], { motif: "space" });
  const variation = add("variation", undefined, "Seeded variation", "variation", world.anatomy.stochasticity?.join(" ")
    ?? "The engine owns deterministic seeded streams for initialization and stochastic updates.", ["stochasticity"], {
    motif: "variation", fixed: "The engine owns the RNG streams and scheduling. Editing a seed configures a fresh derivative run; it does not create another simulation authority."
  });

  switch (template.id) {
    case "flocking-boids":
      add("boids", "population", "Boids", "population", "Abstract steering particles respond to nearby boids without a leader.", ["agents"], { parameters: ["agentCount"] });
      add("state", "boids", "Motion state", "state", "Each boid carries position and velocity plus bounded template-owned steering state.", ["state"]);
      add("position", "state", "Position", "state", "A two-dimensional model position defines where a boid senses neighbors.", ["state"], { affects: ["Neighborhood membership"] });
      add("velocity", "state", "Velocity", "state", "Direction and speed persist between ticks and are changed by steering.", ["state"], { initialization: ["headingDegrees", "headingSpread", "clockwise"], affects: ["Next position"] });
      add("groups", "population", "Initialized groups", "population", "The group-aware mode assigns bounded groups at initialization; group labels affect steering weights only in that mode.", ["agents"], { capabilityReason: "Template-owned group-aware behavior is supported; groups do not change during a run." });
      add("neighborhood", "dynamics", "Nearby neighbors", "interaction", "Boids sense other boids inside the perception radius; this is spatial proximity, not a persistent network.", ["local-neighborhood"], { parameters: ["perceptionRadius"], reads: ["Position"], affects: ["Steering inputs"] });
      add("steering", "dynamics", "Steering balance", "process", "Alignment, cohesion, and separation contribute to one bounded steering update.", [], { motif: "steering", parameters: ["maxForce"], reads: ["Neighbor position and velocity"], affects: ["Velocity"] });
      add("alignment", "steering", "Alignment", "interaction", "Turn toward nearby headings.", ["local-neighborhood"], { motif: "alignment", parameters: ["alignmentWeight"], reads: ["Neighbor velocity"], affects: ["Velocity through steering"] });
      add("cohesion", "steering", "Cohesion", "interaction", "Steer toward the local center of nearby boids.", ["local-neighborhood"], { motif: "cohesion", parameters: ["cohesionWeight"], reads: ["Neighbor position"], affects: ["Velocity through steering"] });
      add("separation", "steering", "Separation", "interaction", "Steer away from close neighbors to limit crowding.", ["local-neighborhood"], { motif: "separation", parameters: ["separationWeight", "separationRadius"], reads: ["Close neighbor position"], affects: ["Velocity through steering"] });
      add("movement", "dynamics", "Movement", "process", "Bounded velocity advances position and changes who will be nearby on the next tick.", ["movement"], { parameters: ["maxSpeed"], reads: ["Velocity"], affects: ["Position", "Next neighborhood"] });
      add("boundary", "environment", "Edges & boundary", "space", "The selected wrap, bounce, or clamp rule handles the edge of the continuous model space.", [], { motif: "boundary", parameters: ["boundaryMode"], fixed: "A geometric edge rule is not a general BoundaryEnvironmentModel." });
      add("noise", "variation", "Steering noise", "variation", "A bounded seeded perturbation changes steering; this is not an uncertainty ensemble.", ["stochasticity"], { parameters: ["noise"], affects: ["Steering"] });
      relate("position", "neighborhood", "defines proximity", "Current position determines nearby boids.");
      relate("neighborhood", "steering", "supplies local inputs", "Local neighbor states inform the steering balance.");
      relate("alignment", "velocity", "contributes heading alignment", "Its weighted contribution turns velocity toward nearby headings within the combined steering update.");
      relate("cohesion", "velocity", "contributes attraction", "Its weighted contribution turns velocity toward the local neighbor center within the combined steering update.");
      relate("separation", "velocity", "contributes crowding avoidance", "Its weighted contribution turns velocity away from close neighbors within the combined steering update.");
      relate("groups", "steering", "weights same-group neighbors in group-aware mode", "Initialized groups affect alignment and cohesion affinity only when the template's group-aware mode is selected.");
      relate("noise", "steering", "adds seeded perturbation", "The steering update combines bounded seeded noise with the local steering contributions.");
      relate("steering", "velocity", "updates bounded velocity", "The template combines its weighted steering contributions and bounds the resulting velocity.");
      relate("velocity", "movement", "advances motion", "Movement reads the updated bounded velocity.");
      relate("boundary", "movement", "handles the outer edge", "The selected geometric rule handles motion at the model-space boundary.");
      relate("movement", "position", "updates position", "Movement changes the position used on the next tick.");
      break;
    case "predator-prey":
      add("prey", "population", "Prey", "population", "Moving prey can reproduce and can be removed by a predator encounter. Prey do not carry an energy component.", ["agents"], { motif: "prey", parameters: ["initialPrey"] });
      add("predators", "population", "Predators", "population", "Moving predators consume prey and survive while their model energy remains positive.", ["agents"], { motif: "predator", parameters: ["initialPredators"] });
      add("energy", "predators", "Predator energy", "state", "Only predators carry this scalar state. Successful predation adds energy; ticks drain it, and reproduction splits the parent's energy with its offspring.", ["state"], { motif: "energy", parameters: ["predatorEnergyGain", "predatorEnergyLoss"], reads: ["Consumed prey", "Elapsed ticks"], affects: ["Predator reproduction", "Predator death"], fixed: "This Energy component is template-owned. It does not implement generic resource, stock, or flow artifacts." });
      add("position", "population", "Position & velocity", "state", "Both species carry position and velocity in the same continuous space.", ["state"]);
      add("consumption", "dynamics", "Predation encounter", "interaction", "A predator can consume at most one nearby prey per tick; removal and energy gain use the template command path.", ["consumption", "local-neighborhood"], { parameters: ["predationRadius"], reads: ["Nearby prey"], affects: ["Prey count", "Predator energy"] });
      add("birth", "dynamics", "Reproduction", "process", "Prey reproduce through seeded trials. Predators reproduce above their configured energy threshold.", ["birth-death"], { parameters: ["preyReproductionProbability", "predatorReproductionThreshold"], reads: ["Predator energy", "Seeded prey trial"], affects: ["Population counts"] });
      add("death", "dynamics", "Energy depletion", "process", "Predators with depleted model energy are removed.", ["birth-death"], { reads: ["Predator energy"], affects: ["Predator count"] });
      add("movement", "dynamics", "Movement", "process", "Seeded headings and bounded speed move both species through possible encounters.", ["movement"], { parameters: ["movementSpeed"], affects: ["Encounter opportunities"] });
      add("boundary", "environment", "Wrapping field", "space", "Both species wrap at the edges of the fixed continuous field.", [], { motif: "boundary", fixed: "The template fixes wrap handling; no authored environment or habitat field is executed." });
      relate("prey", "consumption", "encountered locally", "Available nearby prey can be consumed.");
      relate("predators", "consumption", "seek nearby prey", "Each predator can consume at most one available nearby prey per tick.");
      relate("consumption", "energy", "adds energy", "A successful encounter supplies predator energy.");
      relate("position", "consumption", "defines encounter proximity", "Current positions determine which prey are within the predator's encounter radius.");
      relate("movement", "position", "changes future encounters", "Movement updates both species' positions before the next tick's predation checks.");
      relate("boundary", "movement", "wraps motion at edges", "The fixed wrapping rule keeps moving agents in the model field.");
      relate("energy", "birth", "enables reproduction", "Predator reproduction requires sufficient energy.");
      relate("birth", "energy", "splits predator energy", "Predator reproduction divides the parent's energy between parent and offspring.");
      relate("energy", "death", "depletion removes predators", "Energy loss can remove predators and change later predation pressure.");
      relate("death", "predators", "removes depleted predators", "Only predators with depleted energy are removed by this rule.");
      relate("birth", "population", "changes abundance", "New agents change the population available to later encounters.");
      break;
    case "epidemic-spread":
      add("agents", "population", "Moving agents", "population", "A homogeneous model population moves through local contacts.", ["agents"], { parameters: ["agentCount"] });
      add("state", "agents", "Infection state", "state", "Every agent occupies one of three model states; these are not real case records.", ["state"]);
      add("susceptible", "state", "Susceptible", "state", "Susceptible agents can change state after a successful contact trial.", ["state"]);
      add("infected", "state", "Infected", "state", "Initialized infected count comes from the selected recipe's Initial infected count option. The base Initial infected parameter is overridden by these recipe options.", ["state"], { parameters: ["initialInfected"], initialization: ["initialInfectedCount"], affects: ["Initial contact sources"] });
      add("recovered", "state", "Recovered", "state", "A scheduled recovery changes infected agents to recovered; reinfection is not modeled.", ["state"]);
      add("contact", "dynamics", "Local contact", "interaction", "Infected agents consider susceptible neighbors inside the contact radius. These are spatial contacts, not network edges.", ["local-neighborhood"], { parameters: ["infectionRadius"], reads: ["Position", "Infection state"], affects: ["Transmission trials"] });
      add("transmission", "dynamics", "Transmission", "process", "A seeded model trial can change a susceptible neighbor to infected.", ["transmission", "stochasticity"], { parameters: ["infectionProbability"], reads: ["Susceptible contacts"], affects: ["Infected state", "Scheduled recovery"] });
      add("recovery", "dynamics", "Delayed recovery", "process", "The engine event queue applies the template's recovery transition after the configured tick delay.", ["state"], { parameters: ["recoveryTicks"], reads: ["Scheduled recovery tick"], affects: ["Recovered state"], fixed: "A fixed template recovery event does not execute general feedback/delay artifacts or disease-specific biology." });
      add("movement", "dynamics", "Movement", "process", "Agents move through the shared field at the configured model speed.", ["movement"], { parameters: ["movementSpeed"], affects: ["Future contacts"] });
      add("boundary", "environment", "Wrapping contact space", "space", "The continuous model field wraps at its edges.", [], { motif: "boundary", fixed: "No mobility schedules, place types, environmental transmission, or calibrated field are present." });
      relate("susceptible", "transmission", "can change state", "Only susceptible agents can receive this infection transition.");
      relate("contact", "transmission", "creates local trials", "Local infected-to-susceptible contacts supply transmission opportunities.");
      relate("movement", "contact", "changes future contacts", "Movement changes which agents can encounter one another on a later tick.");
      relate("boundary", "movement", "wraps motion at edges", "The fixed wrapping rule keeps moving agents inside the contact field.");
      relate("transmission", "infected", "becomes infected", "Successful trials create infected state.");
      relate("infected", "recovery", "schedules recovery", "Each new infection schedules the template recovery event.");
      relate("recovery", "recovered", "changes state after delay", "The due event changes the target agent to recovered.");
      break;
    case "forest-fire":
      add("state", "population", "Cell state", "state", "Each fixed grid cell has a categorical empty, fuel, burning, or burned state.", ["state", "grid"]);
      add("fuel", "state", "Fuel cells", "state", "Fuel is a categorical cell state that may ignite; there is no continuous fuel stock or generic resource runtime.", ["state"], { parameters: ["initialFuelDensity"] });
      add("burning", "state", "Burning cells", "state", "Burning cells can spread to local fuel neighbors while their burn timer is active.", ["state"], { parameters: ["initialIgnitionCount"] });
      add("empty", "state", "Empty & burned cells", "state", "Empty cells interrupt the fuel path. Burned cells record completed burning.", ["state"]);
      add("spread", "dynamics", "Neighbor ignition", "interaction", "Burning cells perform seeded spread trials only for adjacent fuel cells.", ["transmission", "local-neighborhood"], { parameters: ["spreadProbability"], reads: ["Burning neighbors", "Fuel state"], affects: ["New burning cells"] });
      add("burnout", "dynamics", "Burn duration", "process", "A per-cell burn timer determines when burning changes to burned.", ["state"], { parameters: ["burnDuration"], affects: ["Burned state"] });
      add("regrowth", "dynamics", "Optional regrowth", "process", "The existing seeded regrowth trial can return empty or burned cells to fuel.", ["state", "stochasticity"], { parameters: ["regrowthProbability"], affects: ["Fuel state"] });
      add("grid", "environment", "Grid geometry", "space", "Fixed cells form a discrete rectangular neighborhood space.", ["grid"], { parameters: ["gridWidth", "gridHeight"] });
      add("neighborhood", "grid", "Cell adjacency", "interaction", "The selected local neighborhood determines which cells share a spread path.", ["grid", "local-neighborhood"], { parameters: ["neighborMode"] });
      add("boundary", "grid", "Grid boundary", "space", "The chosen boundary rule controls adjacency across outer edges.", ["grid"], { parameters: ["boundaryMode"] });
      add("lightning", "variation", "Independent ignition", "variation", "A seeded independent ignition trial is an abstract rule, not weather simulation.", ["stochasticity"], { parameters: ["lightningProbability"], affects: ["Burning cells"] });
      relate("fuel", "spread", "eligible neighbors", "Only fuel cells can receive the local ignition transition.");
      relate("neighborhood", "spread", "defines spread paths", "Discrete adjacency controls available local paths.");
      relate("spread", "burning", "ignites fuel", "Successful spread trials produce burning cells.");
      relate("burning", "burnout", "advances burn timer", "Burning persists for the configured duration.");
      relate("burnout", "empty", "leaves a burned cell", "Once the burn duration is reached, the burning cell becomes burned.");
      relate("empty", "regrowth", "eligible for regrowth", "Both empty and burned cells can enter the optional seeded regrowth trial.");
      relate("regrowth", "fuel", "restores fuel state", "Optional seeded regrowth changes the categorical state.");
      relate("boundary", "neighborhood", "determines edge adjacency", "The geometric grid boundary decides whether neighboring cells can lie across an outer edge.");
      relate("lightning", "burning", "can independently ignite fuel", "Independent seeded trials can ignite fuel without an already burning neighbor.");
      break;
    case "schelling-segregation":
      add("groups", "population", "Two abstract groups", "population", "Occupying agents carry one of two abstract group labels; labels are not real social identities.", ["agents"], { parameters: ["density", "groupRatio"] });
      add("state", "groups", "Group & satisfaction", "state", "Group membership and local similarity determine a template-defined satisfaction state.", ["state"]);
      add("neighborhood", "dynamics", "Local composition", "interaction", "Occupied neighbor cells contribute to the local same-group fraction.", ["local-neighborhood", "grid"], { parameters: ["neighborhoodRadius"], reads: ["Neighbor group labels"] });
      add("threshold", "dynamics", "Similarity threshold", "process", "Agents compare the local same-group fraction with one shared threshold.", ["state"], { parameters: ["similarityThreshold"], reads: ["Local composition"], affects: ["Satisfaction"] });
      add("movement", "dynamics", "Relocation", "process", "A bounded fraction of dissatisfied agents move to available empty cells.", ["movement"], { parameters: ["moveFractionPerTick"], reads: ["Dissatisfied agents", "Empty cells"], affects: ["Next neighborhood"] });
      add("grid", "environment", "Occupied & empty cells", "space", "The fixed grid contains one agent or a vacancy per occupied or empty cell.", ["grid"], { parameters: ["rows", "cols"] });
      relate("groups", "neighborhood", "supplies group labels", "Abstract labels determine local composition.");
      relate("neighborhood", "threshold", "provides similarity", "The template evaluates the local fraction.");
      relate("threshold", "movement", "selects dissatisfied agents", "Dissatisfaction can make an agent eligible for relocation.");
      relate("threshold", "state", "determines satisfaction", "Local similarity is compared with the shared threshold; agents with no occupied neighbors are satisfied.");
      relate("movement", "grid", "changes occupancy", "Relocation changes who occupies cells and thus later neighborhoods.");
      relate("grid", "neighborhood", "defines neighboring occupants", "Grid adjacency and occupancy determine which abstract labels contribute to local similarity.");
      break;
    case "opinion-dynamics":
      add("agents", "population", "Opinion agents", "population", "Stationary model agents carry bounded scalar opinions; outputs are not measured beliefs.", ["agents"], { parameters: ["agentCount", "initialPolarization"] });
      add("state", "agents", "Scalar opinion", "state", "An opinion is a bounded numeric model value; source and memory terms remain stylized template state.", ["state"], { initialization: ["meanOpinion", "spread"] });
      add("neighborhood", "dynamics", "Nearby influence", "interaction", "Spatial neighbors contribute scalar influence without persistent network links.", ["local-neighborhood"], { parameters: ["influenceRadius", "influenceStrength"], reads: ["Neighbor opinions"], affects: ["Opinion update"] });
      add("social-learning", "dynamics", "Optional social-learning mode", "process", "Only the supported socialLearning mode uses bounded trust, confirmation, memory, source, and crowd terms. This is not cognition or a general social-learning runtime.", ["state"], { parameters: ["socialLearningRate", "socialTrustWeight", "confirmationBias", "memoryDecay", "salienceWeight", "maxOpinionShiftPerTick"] });
      add("sources", "social-learning", "Two fixed model sources", "interaction", "Numeric source settings are used only in socialLearning mode. Credibility is a model parameter, not a verified truth score.", ["state"], { parameters: ["sourceExposureStrength", "sourceTrustSensitivity", "maxSourceInfluencePerTick", "sourceOneSignal", "sourceOneCredibility", "sourceOneExposure", "sourceOneInfluence", "sourceTwoSignal", "sourceTwoCredibility", "sourceTwoExposure", "sourceTwoInfluence"] });
      add("crowd", "social-learning", "Aggregate crowd signal", "interaction", "A bounded numeric input is used only in socialLearning mode; it does not simulate thousands of people or execute spatial field artifacts.", ["state"], { parameters: ["crowdSignal", "crowdSignalStrength"] });
      add("positions", "environment", "Fixed spatial positions", "space", "Initialized positions define local influence neighborhoods; agents do not move.", [], { motif: "space" });
      add("noise", "variation", "Opinion noise", "variation", "A bounded seeded perturbation updates scalar opinions.", ["stochasticity"], { parameters: ["noise"] });
      relate("state", "neighborhood", "supplies scalar values", "Neighbor opinions supply the template's local inputs.");
      relate("neighborhood", "state", "updates opinion", "Local influence changes the bounded scalar value.");
      relate("sources", "social-learning", "mode-dependent exposure", "These fixed source terms are used only by the optional socialLearning mode.");
      relate("crowd", "social-learning", "mode-dependent aggregate input", "The optional socialLearning mode includes the bounded numeric crowd signal.");
      relate("social-learning", "state", "bounded mode-dependent update", "The optional template mode combines bounded terms in its opinion update.");
      relate("positions", "neighborhood", "defines fixed proximity", "Initialized spatial positions define nearby opinion agents and do not move during the run.");
      relate("noise", "state", "adds bounded seeded variation", "The noise update perturbs scalar opinion using the engine-owned RNG stream.");
      break;
    case "neural-excitation-network":
      add("neurons", "population", "Abstract excitable nodes", "population", "Template-owned nodes propagate abstract signals. They are not biological neurons or cognitive agents.", ["agents"], { parameters: ["neuronCount", "initialActiveRatio", "excitatoryRatio"] });
      add("state", "neurons", "Activation state", "state", "Activation and threshold are model variables, not membrane voltage or empirical neural measurements.", ["state"], { parameters: ["globalThreshold", "thresholdVariance", "baselineExcitability"] });
      add("refractory", "state", "Refractory counter", "state", "A bounded tick counter restricts repeated firing.", ["state"], { parameters: ["refractoryTicks"] });
      add("propagation", "dynamics", "Weighted propagation", "process", "Firing sends bounded template-owned signals along directed synapses.", ["network"], { parameters: ["averageSynapseWeight", "weightVariance", "activationDecay", "maxFiringFraction"], reads: ["Activation", "Directed synapses"], affects: ["Delayed signals", "Later activation"] });
      add("delay", "propagation", "Bounded signal delays", "process", "Template-owned signals wait a bounded tick delay in a capped queue.", ["state"], { parameters: ["signalDelayMin", "signalDelayMax", "maxSignalQueueSize"], fixed: "This queue is scoped to Neural Excitation Network; it does not execute general feedback/delay artifacts." });
      add("readout", "dynamics", "Optional decision readout", "process", "When enabled, designer-labeled output assemblies map to bounded categorical choices. This is not cognition, reasoning, or strategy adaptation.", ["state"], { parameters: ["decisionReadoutEnabled", "decisionThreshold", "decisionMargin", "decisionWindowTicks", "outputBias", "opponentChoiceMode", "fixedOpponentChoice"] });
      add("network", "environment", "Directed network", "space", "The Neural template owns an actual runtime network. These explanatory Workbench relationships cannot edit its edges.", ["network"], { parameters: ["networkTopology", "connectionDensity"], fixed: "Network execution belongs only to this existing template. Workbench and Builder graphs remain non-executable." });
      add("stimulus", "variation", "Noise & stimulus", "variation", "Bounded seeded input provides abstract excitation; no biological recording or external model call is involved.", ["stochasticity"], { parameters: ["noiseLevel", "externalStimulusRate", "externalStimulusStrength"] });
      relate("network", "propagation", "routes directed signals", "The template's actual synapses define signal routes.");
      relate("state", "propagation", "threshold can fire", "Activation above the template threshold can emit a signal.");
      relate("propagation", "delay", "queues bounded signals", "Signals are delayed within the template's bounded queue.");
      relate("delay", "state", "delivers later input", "Due signals contribute to later activation.");
      relate("refractory", "propagation", "limits firing eligibility", "A node with a remaining refractory counter cannot fire again yet.");
      relate("stimulus", "state", "adds abstract input", "External-stimulus trials and bounded noise contribute to the template's activation update.");
      relate("state", "readout", "optional labeled output", "Enabled readout derives categorical output from designated assemblies.");
      break;
  }

  const initialization = pieces.find((piece) => piece.id === "initialization")!;
  initialization.controls.push({ group: "run", key: "initializationPreset" });
  dynamics.controls.push({ group: "run", key: "behaviorMode" });
  variation.controls.push({ group: "run", key: "seed" });
  for (const definition of template.parameterDefinitions) {
    (parameterOwners.get(definition.key) ?? dynamics).controls.push({ group: "parameters", key: definition.key });
  }
  for (const definition of agentCompositionDefinitionsForTemplate(template)) {
    const owner = parameterOwners.get(definition.key)
      ?? (definition.key === "groupCount" || definition.key === "primaryGroupRatio" ? pieces.find((piece) => piece.id === "groups") : undefined)
      ?? population;
    owner.controls.push({ group: "agentComposition", key: definition.key });
  }
  for (const definition of environmentOptionDefinitionsForTemplate(template)) {
    (parameterOwners.get(definition.key) ?? environment).controls.push({ group: "environmentOptions", key: definition.key });
  }
  for (const key of optionKeys) {
    (initializationOwners.get(key) ?? initialization).controls.push({ group: "initializationOptions", key });
  }

  return {
    templateId: template.id, templateName: template.name, starterId: world.id, title: world.title,
    summary: world.oneSentencePremise, visualKind: world.visualKind,
    rootIds: pieces.filter((piece) => !piece.parentId).map((piece) => piece.id), pieces, relationships
  };
}

export function findWorkbenchPieceForControl(model: WorkbenchModel, group: WorkbenchControlGroup, key: string): WorkbenchPiece | undefined {
  return model.pieces.find((piece) => piece.controls.some((control) => control.group === group && control.key === key));
}

/** Resolve on demand from the same typed contracts used by Scenario Builder. */
export function resolveWorkbenchControlDefinition(
  reference: WorkbenchControlReference, template: SimulationTemplate, scenario: Pick<AuthoredScenario, "initializationPreset">
): ParameterDefinition | undefined {
  const definitions = reference.group === "parameters" ? template.parameterDefinitions
    : reference.group === "agentComposition" ? agentCompositionDefinitionsForTemplate(template)
      : reference.group === "environmentOptions" ? environmentOptionDefinitionsForTemplate(template)
        : reference.group === "initializationOptions" ? findInitializationPreset(template, scenario.initializationPreset)?.optionDefinitions ?? [] : [];
  return definitions.find((definition) => definition.key === reference.key);
}
